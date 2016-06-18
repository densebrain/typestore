

import * as PouchDB from 'pouchdb'

//const PouchDB = require('pouchdb')
PouchDB.debug.enable('pouchdb:find')
PouchDB.plugin(require('pouchdb-find'))

declare global {
	interface PouchApi {
		createIndex: (obj:any,callback?:any) => Promise<any>
		deleteIndex: (obj:any,callback?:any) => Promise<any>
		getIndexes: (callback?:any) => Promise<any>
		find: (request:any,callback?:any) => Promise<any>
	}

	interface PouchDB {
		plugin: (plugin:any) => void
		debug:any
	}
}

import {
	ICoordinator,
	ICoordinatorOptions,
	Repo,
	IModel,
	PluginType,
	IStorePlugin,
	IModelType,
	Log,
	PluginEventType,
	repoAttachIfSupported,
	IModelAttributeOptions,
	assert
} from 'typestore'

import {PouchDBPKIndex,PouchDBTypeIndex,PouchDBAttributePrefix} from './PouchDBConstants'
import {PouchDBRepoPlugin} from "./PouchDBRepoPlugin";


const log = Log.create(__filename)

/**
 * Options interface
 */
export interface IPouchDBOptions {

	/**
	 * Database name for Dexie/indexdb
	 */
	filename:string
}

/**
 * Default options
 */
export const PouchDBOptionDefaults = {
	filename:null,
	version: 1
}

/**
 * Uses dexie under the covers - its a mature library - and i'm lazy
 */
export class PouchDBPlugin implements IStorePlugin {

	type = PluginType.Store

	supportedModels:any[]

	private coordinator:ICoordinator
	private internalDb:PouchDB
	private schema:any
	private repoPlugins:{[modelName:string]:PouchDBRepoPlugin<any>} = {}

	constructor(private opts:IPouchDBOptions,...supportedModels:any[]) {
		this.opts = Object.assign({},PouchDBOptionDefaults,opts)
		assert(this.opts.filename,'A valid database path is required')

		this.supportedModels = supportedModels
	}

	private newPouch() {
		return new PouchDB(this.opts.filename)
	}

	private open() {
		this.internalDb = this.newPouch()


		return this.internalDb
	}

	get db() {
		return this.internalDb
	}


	handle(eventType:PluginEventType, ...args):boolean|any {
		switch(eventType) {
			case PluginEventType.RepoInit:
				return repoAttachIfSupported(args[0] as Repo<any>, this)
		}
		return false
	}


	async makeIndex(db,modelName:string, indexName:string,fields:string[]) {
		indexName = `${modelName ? modelName + '_' : ''}${indexName}`

		if (fields.indexOf('type') === -1)
			fields = ['type',...fields]

		const
			indexesResult = await db.getIndexes(),
			indexes = indexesResult.indexes,
			existingIdxIndex = indexes.findIndex(item => item.name === indexName),
			existingIndex = existingIdxIndex > -1 ? indexes[existingIdxIndex] : null,
			existingFields = (!existingIndex) ? [] :
				existingIndex.def.fields.reduce((fieldList,nextFieldDef) => {
					fieldList.push(...Object.keys(nextFieldDef))
					return fieldList
				},[])

		if (existingIndex && Array.isEqual(existingFields,fields)) {
			log.info(`Index def has not changed: ${indexName}`)
		} else {
			if (existingIdxIndex > -1) {
				log.info(`Index changed, deleting old version: ${indexName}`)
				await db.deleteIndex(existingIndex)
			}

			log.info(`Index being created: ${indexName}`)
			await db.createIndex({index: {name:indexName,fields}})
		}
	}

	async init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		this.coordinator = coordinator
		return coordinator
	}



	async start():Promise<ICoordinator> {
		const models = this.coordinator.getModels()

		log.debug(`Opening database`,this.opts.filename)

		const db = this.open()
		const makeIndexPromises = [
			this.makeIndex(db,null,PouchDBTypeIndex,['type'])
		]


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
					assert(!primaryKey,'You can not specify a second index on the primary key')
					makeIndexPromises.push(this.makeIndex(db,modelType.name,index.name || name,[PouchDBAttributePrefix + name]))
				}

				if (primaryKey) {
					makeIndexPromises.push(this.makeIndex(db,modelType.name,PouchDBPKIndex,[PouchDBAttributePrefix + name,'type']))
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

		// Wait for indexes
		await Promise.all(makeIndexPromises)

		log.debug('PouchDB store is ready')
		return this.coordinator


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