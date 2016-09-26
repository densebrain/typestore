
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
	assert,
	IModelType
} from 'typestore'


import {PouchDBPKIndex,PouchDBTypeIndex} from './PouchDBConstants'
import {PouchDBRepoPlugin} from "./PouchDBRepoPlugin";
import {makeMangoIndex} from './PouchDBIndexes'
import {LogLevel,setOverrideLevel} from 'typelogger'
import { mkdirp } from "./PouchDBUtil"

const
	log = Log.create(__filename),
	Bluebird = require('bluebird'),
	
	// Type Design DOC (only needed when using a single database)
	DesignDocsGlobal = [
		
	],
	DesignDocs = [{
		_id: '_design/_ts_indexes',
		views: {
			getCount: {
				map: function (doc) {
					emit(doc.type);
				}.toString(),
				group: true,
				reduce: '_count',
				include_docs: false
			}
		}
	}]


setOverrideLevel(log,LogLevel.DEBUG)

let
	PouchDB = null

/**
 * Load PouchDB dep
 */
function initPouchDB() {
	PouchDB = require('./PouchDBSetup').PouchDB
}


/**
 * Model Name -> Repo Plugin
 */
export type TPouchRepoMap = {[modelName:string]:PouchDBRepoPlugin<any>}

/**
 * Pouch Replication Config
 */
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
	overwriteConflicts?:boolean
	databasePerRepo?:boolean
	createOptions?:any
	cacheSize?:number,
	replication?: IPouchDBReplication
	sync?: IPouchDBReplication
}

/**
 * Default options
 */
export const PouchDBOptionDefaults = {
	filename:null,
	databasePerRepo: false
}

/**
 * Uses dexie under the covers - its a mature library - and i'm lazy
 */
export class PouchDBPlugin implements IStorePlugin {
	
	/**
	 * Plugin type
	 *
	 * @type {PluginType}
	 */
	
	readonly type = PluginType.Store
	
	/**
	 * All supported models
	 */
	supportedModels:any[]
	
	/**
	 * Whether we should overwrite docs on conflicts
	 *
	 * @returns {IPouchDBOptions|boolean}
	 */
	get overwriteConflicts() {
		return this.opts && this.opts.overwriteConflicts === true
	}
	
	/**
	 * Reference to the current coordinator
	 */
	private coordinator:ICoordinator
	
	/**
	 * Internal db reference
	 */
	private globalDatabase:any
	
	/**
	 * Per repo db map
	 */
	private repoDatabases:{[modelName:string]:any} = {}
	
	
	
	/**
	 * Synchronization handler
	 */
	private syncHandler:any
	
	/**
	 * Schema ref
	 */
	private schema:any
	
	/**
	 * All Repo Plugins
	 * @type {{}}
	 */
	private repoPlugins:TPouchRepoMap = {}

	constructor(private opts:IPouchDBOptions,...supportedModels:any[]) {
		initPouchDB()
		
		this.opts = Object.assign({},PouchDBOptionDefaults,opts)
		assert(this.opts.filename,'A valid database path is required')

		this.supportedModels = supportedModels
	}
	
	
	/**
	 * New PouchDB instance
	 *
	 * @param modelName - optional param, if specified then a
	 *  database for that specific model is created by applying "BASE/${modelName}"
	 *  template for the database name
	 */
	private newPouch(modelName = null) {
		const
			filename = `${this.opts.filename}${modelName ? `/${modelName}` : ''}`
		
		
		
		if (filename.startsWith('/')) {
			try {
				log.debug(`Checking filesystem path exists: ${filename}`)
				mkdirp(this.opts.filename)
				
			} catch (err) {
				log.warn(`Failed to create db directory`,err)
			}
		}
			
		
		log.debug(`Using filename ${filename} for model ${modelName || ''}`)
		
		return new PouchDB(
			filename,
			this.opts.createOptions || {}
		)
	}
	
	/**
	 * Open/Create a database
	 *
	 * @returns {any}
	 */
	async open(specificModelType:IModelType = null) {
		
		const
			modelName = specificModelType && specificModelType.name,
			{useGlobal} = this
		
		
		// If NOT global then repo is require with valid model name
		assert(useGlobal || (!useGlobal && modelName),`If this is not a global database then you must pass a repo in as well`)
		
		if (useGlobal && this.globalDatabase)
			return this.globalDatabase
		
		// Create ref for DB
		let db
		
		
		// If we already created the database then return it
		if (!useGlobal && (db = this.repoDatabases[modelName]))
			return db
		
		// Create the database
		db = await this.newPouch(modelName)
		
		if (useGlobal)
			this.globalDatabase = db
		else
			this.repoDatabases[modelName] = db
		
		// Configure replication
		const
			{
				replication,
				sync
			} = this.opts
		
		
		// Setup replication and/or sync
		const makeRemoteName = (to) => `${replication.to}${useGlobal ? "" : `-${modelName}`}`
		
		if (replication && replication.to) {
			const
				remoteDB = new PouchDB(makeRemoteName(replication.to))
			
			this.syncHandler = PouchDB.replicate(db,remoteDB,{
				live: replication.live,
				retry: replication.retry
			})
		}

		
		if (sync && sync.to) {
			const
				remoteDB = new PouchDB(makeRemoteName(sync.to))
			
			this.syncHandler = PouchDB.replicate(db,remoteDB,{
				live: replication.live,
				retry: replication.retry
			})
		}
		
		/**
		 * Load design docs
		 * @param docs
		 */
		const loadDesignDocs = async (docs):Promise<any> => {
			log.debug(`Loading design docs`,docs)
			
			for (let doc of docs) {
				log.info(`Creating index ${doc._id}`)
				await Promise.resolve(db
					.get(doc._id)
					.then(existingDoc => {
						if (existingDoc)
							doc._rev = existingDoc._rev
					})
					.catch(err => {
						if (err.status === 404) return
						log.error(`Failed to load design docs`, docs)
						throw err
					})
				)
				
				log.info(`Created index ${doc._id}`)
				await db.put(doc)
			}
			
		}
		
		// Add global design docs
		if (useGlobal)
			await loadDesignDocs(DesignDocsGlobal)
		
		// Add design docs that are used everywhere
		await loadDesignDocs(DesignDocs)
		
		
		// Now init the database
		// Create type index
		if (useGlobal)
			await makeMangoIndex(true,db, null, PouchDBTypeIndex, 'asc', [ 'type' ])
		
		const
			indexArgs = [],
			models = this.coordinator.getModels()
		
		
		// CREATE ALL INDEXES
		//
		// (If per-repo databases then just for the provided repo)
		// - OR -
		// (In global create all)
		this.schema = models
			.filter(modelType =>  useGlobal || (modelType.name === specificModelType.name))
			.reduce((newSchema, modelType) => {
				
				// Get all the known attributes for the table
				const
					attrs = modelType
						.options
						.attrs
						.filter(attr => !attr.transient)
						.reduce((newDetails, attr:IModelAttributeOptions) => {
							const
								{ index, name, primaryKey, isArray } = attr
							
							if (attr.secondaryKey)
								throw new Error('Secondary keys are not supported in PouchDB')
							
							
							if (index) {
								if (primaryKey)
									throw new Error('You can not specify a second index on the primary key')
								
								indexArgs.push([
									useGlobal,
									db,
									modelType.name,
									index.name || name, 'asc',
									[ name  ]
								])
							}
							
							if (primaryKey) {
								indexArgs.push([
									useGlobal,
									db,
									modelType.name,
									PouchDBPKIndex,
									'asc',
									[ name  ]
								])
							}
							
							newDetails[ name ] = attr
							
							return newDetails
						}, {})
				
				
			// Added the attribute descriptor to the new schema
			newSchema[ modelType.name ] = {
				name: modelType.name,
				attrNames: Object.keys(attrs),
				attrs
			}
			
			log.debug(`Created schema for ${modelType.name}`, newSchema[ modelType.name ])
			return newSchema
		}, {})
		
		log.debug(`Now creating ${indexArgs.length} indexes`)
		await Promise.all(indexArgs.map(args => makeMangoIndex.apply(null, args)))
		
		return db


	}
	
	/**
	 * Global databases
	 *
	 * @returns {boolean}
	 */
	get useGlobal() {
		return this.opts.databasePerRepo !== true
	}
	
	/**
	 * Get database instance
	 *
	 * @param repo - required IF not using global database
	 *
	 * @returns {any}
	 */
	getDB(repo:PouchDBRepoPlugin<any> = null) {
		const
			modelName = repo && repo.modelType.name,
			{useGlobal} = this
		
		const
			hasLocal = (!useGlobal && this.repoDatabases[modelName]),
			hasGlobal = (useGlobal && this.globalDatabase)
		
		assert(
			hasLocal || hasGlobal,
			`DB Not available for ${modelName} hasLocal=${hasLocal} hasGlobal=${hasGlobal}`)
		
		
		return useGlobal ? this.globalDatabase : this.repoDatabases[modelName]
	}
	
	/**
	 * Count models of a specific type
	 *
	 * @param type
	 * @param repo
	 * @returns {number}
	 */
	async getModelCount(type:string,repo:PouchDBRepoPlugin<any>):Promise<number> {
		
		const
			db = this.getDB(repo)
		
		// Use global type to count
		const
			{ rows } = await db.query('_ts_indexes/getCount', {
				key: type,
				reduce: true,
				group: true,
				include_docs: false
			})
		
		assert(rows.length < 2, 'Should only get 1 or 0 rows with count info for: ' + type + ' - received row count ' + rows.length)
		
		return !rows.length ? 0 : rows[ 0 ].value
		
		// // In global use the custom index
		// if (this.useGlobal) {
		//
		//
		// } else {
		// 	const
		// 		dbInfo = await db.info()
		//
		// 	log.debug(`Get database info result`,dbInfo)
		// 	return dbInfo.doc_count
		// }
		
		
	}
	
	/**
	 * Handle a plugin event
	 *
	 * @param eventType
	 * @param args
	 * @returns {any}
	 */
	handle(eventType:PluginEventType, ...args):boolean|any {
		switch(eventType) {
			case PluginEventType.RepoInit:
				return repoAttachIfSupported(args[0] as Repo<any>, this)
		}
		return false
	}
	
	
	/**
	 * Init plugin store
	 *
	 * @param coordinator
	 * @param opts
	 * @returns {Promise<ICoordinator>}
	 */
	init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		this.coordinator = coordinator
		return Bluebird.resolve(coordinator)
	}
	
	
	/**
	 * Start the plugin
	 *
	 * @returns {ICoordinator}
	 */
	async start():Promise<ICoordinator> {
		
		log.debug(`Opening database`,this.opts.filename)
		
		// USE GLOBAL DB / includes type column
		if (this.useGlobal) {
			const
				db = await this.open(),
				info = await db.info()
			
			log.info('Global PouchDB Database is open', info)
		}
		// SEPARATE DB FOR EACH MODEL
		else {
			
			const
				modelTypes = this.coordinator.getModels()
			
			log.info(`Creating individual databases for each model: `,modelTypes.map(it => it.name).join(','))
			
			for (let modelType of modelTypes) {
				log.info(`Creating database for ${modelType.name}`)
				await this.open(modelType)
				log.info(`Created database for ${modelType.name}`)
			}
		}
		
		return this.coordinator
	}
	
	/**
	 * Delete all current databases
	 */
	deleteDatabase():Promise<any> {
		return this.globalDatabase.destroy()
	}
	
	/**
	 * Shutdown all PouchDB instances that we manage
	 *
	 * @returns {ICoordinator}
	 */
	async stop():Promise<ICoordinator> {
		if (this.globalDatabase)
			try {
				await new Promise((resolve, reject) => {
					this.globalDatabase.close(() => {
						log.info('Database closed')
						resolve()
					})
				})
			} catch (err) {
				log.error('Failed to shutdown db',err)
			}

		return this.coordinator
	}
	
	/**
	 * Sync models
	 *
	 * @returns {Promise<ICoordinator>}
	 */
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
		let
			plugin = this.repoPlugins[repo.modelType.name]
		
		if (plugin)
			return plugin.repo as T

		plugin = new PouchDBRepoPlugin(this,repo)
		return plugin.repo as T
	}
}