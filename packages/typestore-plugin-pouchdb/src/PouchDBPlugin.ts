
let PouchDB = null
const Bluebird = require('bluebird')

function initPouchDB() {
	PouchDB = require('./PouchDBSetup').PouchDB
}

import {
	ICoordinator,
	ICoordinatorOptions,
	Repo,
	IModel,
	PluginType,
	IStorePlugin,
	Log,
	PluginEventType,
	repoAttachIfSupported,
	IModelAttributeOptions,
	assert
} from 'typestore'


import {PouchDBPKIndex,PouchDBTypeIndex} from './PouchDBConstants'
import {PouchDBRepoPlugin} from "./PouchDBRepoPlugin";
import {getIndexMap,makeMangoIndex} from './PouchDBIndexes'


const log = Log.create(__filename)

const DesignDocs = [
	{
		_id: '_design/_ts_indexes',
		views: {
			getCount: {
				map: function (doc) {
					emit(doc.type);
				}.toString(),
				reduce: '_count'
			}
		}
	}
]


export interface IPouchDBReplication {
	to:string
	live?:boolean
	retry?:boolean
}

/**
 * Options interface
 */
export interface IPouchDBOptions {

	filename:string
	createOptions?:any
	replication?: IPouchDBReplication
	sync?: IPouchDBReplication
}

/**
 * Default options
 */
export const PouchDBOptionDefaults = {
	filename:null
}

/**
 * Uses dexie under the covers - its a mature library - and i'm lazy
 */
export class PouchDBPlugin implements IStorePlugin {

	type = PluginType.Store

	supportedModels:any[]

	private coordinator:ICoordinator
	private internalDb:any
	private syncHandler:any
	private schema:any
	private repoPlugins:{[modelName:string]:PouchDBRepoPlugin<any>} = {}

	constructor(private opts:IPouchDBOptions,...supportedModels:any[]) {
		initPouchDB()
		
		this.opts = Object.assign({},PouchDBOptionDefaults,opts)
		assert(this.opts.filename,'A valid database path is required')

		this.supportedModels = supportedModels
	}

	private newPouch() {
		return new PouchDB(this.opts.filename,this.opts.createOptions || {})
	}

	private async open() {
		const db = await this.newPouch()

		const {replication,sync} = this.opts
		if (replication && replication.to) {
			const remoteDB = new PouchDB(replication.to)
			this.syncHandler = PouchDB.replicate(db,remoteDB,{
				live: replication.live,
				retry: replication.retry
			})
		}

		if (sync && sync.to) {
			const remoteDB = new PouchDB(replication.to)
			this.syncHandler = PouchDB.replicate(db,remoteDB,{
				live: replication.live,
				retry: replication.retry
			})
		}

		// Add design docs
		for (let doc of DesignDocs as any) {
			await Promise.resolve(db.get(doc._id))
				.then(existingDoc => {
					if (existingDoc)
						doc._rev = existingDoc._rev
				})
				.catch(err => {
					if (err.status === 404) return
					throw err
				})

			await db.put(doc)
		}


		this.internalDb = db
		return db


	}

	get db() {
		assert(this.internalDb,'Database is not ready yet')
		return this.internalDb
	}

	async getModelCount(type:string):Promise<number> {
		const {rows} = await this.db.query('_ts_indexes/getCount',{
			key: type,
			include_docs: false
		})

		assert(rows.length < 2,'Should only get 1 or 0 rows with count info for: ' + type + ' - received row count ' + rows.length)
		return !rows.length ? 0 : rows[0].value
	}


	handle(eventType:PluginEventType, ...args):boolean|any {
		switch(eventType) {
			case PluginEventType.RepoInit:
				return repoAttachIfSupported(args[0] as Repo<any>, this)
		}
		return false
	}



	init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		this.coordinator = coordinator
		return Bluebird.resolve(coordinator)
	}



	async start():Promise<ICoordinator> {
		const models = this.coordinator.getModels()

		log.debug(`Opening database`,this.opts.filename)

		const db = await this.open()

		log.info('Database is open, grabbing info')
		const info = await db.info()
						log.info('DB Info',info)

		await makeMangoIndex(db,null,PouchDBTypeIndex,'asc',['type'])

		const indexArgs = []

		// Create any/all indexes
		this.schema = models.reduce((newSchema,modelType) => {

			// Get all the known attributes for the table
			const attrs = modelType.options.attrs
				.filter(attr => !attr.transient)


			const attrDetails = attrs.reduce((newDetails,attr:IModelAttributeOptions) => {
				const
					{index,name,primaryKey,isArray} = attr

				if (attr.secondaryKey)
					throw new Error('Secondary keys are not supported in pouchdb')


				if (index) {
					if (primaryKey)
						throw new Error('You can not specify a second index on the primary key')

					indexArgs.push([db,modelType.name,index.name || name,'asc',[name]])
				}

				if (primaryKey) {
					indexArgs.push([db,modelType.name,PouchDBPKIndex,'asc',[name,'type']])
				}

				newDetails[name] = attr

				return newDetails
			},{})



			// Added the attribute descriptor to the new schema
			newSchema[modelType.name] = {
				name: modelType.name,
				attrNames: Object.keys(attrDetails),
				attrs: attrDetails
			}
			log.debug(`Created schema for ${modelType.name}`,newSchema[modelType.name])
			return newSchema
		},{})

		await Bluebird.each(indexArgs,async (args) => {
			await makeMangoIndex.apply(null,args)
		})

		//await Bluebird.each(makeIndexPromises)
		// Wait for indexes
		return this.coordinator





	}

	deleteDatabase():Promise<any> {
		return this.internalDb.destroy()
	}

	async stop():Promise<ICoordinator> {
		if (this.internalDb)
			try {
				await new Promise((resolve, reject) => {
					this.internalDb.close(() => {
						log.info('Database closed')
						resolve()
					})
				})
			} catch (err) {
				log.error('Failed to shutdown db',err)
			}

		return this.coordinator
	}

	syncModels():Promise<ICoordinator> {
		log.debug('Currently the localstorage plugin does not sync models')
		return Promise.resolve(this.coordinator)
	}

	/**
	 * Initialize a new repo
	 * TODO: verify this logic works - just reading it makes me think we could be
	 *  asked to init a repo a second time with the same type and do nothing
	 *
	 * @param repo
	 * @returns {T}
	 */
	initRepo<T extends Repo<M>, M extends IModel>(repo:T):T {
		let plugin = this.repoPlugins[repo.modelType.name]
		if (plugin)
			return plugin.repo as T

		plugin = new PouchDBRepoPlugin(this,repo)
		return plugin.repo as T
	}
}