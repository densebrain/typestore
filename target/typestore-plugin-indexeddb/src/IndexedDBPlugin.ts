

import Dexie from 'dexie'
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
	IFinderPlugin,
	repoAttachIfSupported
} from 'typestore'
import {IndexedDBRepoPlugin} from "./IndexedDBRepoPlugin";


const log = Log.create(__filename)

/**
 * Options interface
 */
export interface IIndexedDBOptions {

	/**
	 * Database name for Dexie/indexdb
	 */
	databaseName?:string
    provider?: {indexedDB:any,IDBKeyRange:any}
}

/**
 * Default options
 */
export const LocalStorageOptionDefaults = {
	databaseName: 'typestore-db'
}

/**
 * Uses dexie under the covers - its a mature library - and i'm lazy
 */
export class IndexedDBPlugin implements IStorePlugin {

	type = PluginType.Store
	
	supportedModels:any[]
	
	private coordinator:ICoordinator
	private internalDb:Dexie
	private repoPlugins:{[modelName:string]:IndexedDBRepoPlugin<any>} = {}
	private tables:{[tableName:string]:Dexie.Table<any,any>}
	
	constructor(private opts:IIndexedDBOptions = {},...supportedModels:any[]) {
		this.opts = Object.assign({},LocalStorageOptionDefaults,opts)
		this.supportedModels = supportedModels
	}

	private open() {
		this.internalDb = new Dexie(this.opts.databaseName,this.opts.provider)
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



	table(modelType:IModelType):Dexie.Table<any,any> {
		let table = this.tables[modelType.name]
		if (!table)
			throw new Error(`Unable to find a table definition for ${modelType.name}`)
			
		
		return table
	}

	async init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		this.coordinator = coordinator
		return coordinator
	}



	async start():Promise<ICoordinator> {
		const models = this.coordinator.getModels()

		// Table needs to be created
		// TODO: Should only use indexed attributes for schema
		const schema:{[key:string]:string} = models.reduce((schema,modelType) => {
			schema[modelType.name] = modelType.options.attrs.map(attr => attr.name).join(',')
			log.info(`Created schema for ${modelType.name}`,schema[modelType.name])
			return schema
		},{})

		log.info(`Creating schema`,schema)
		this.open().version(1).stores(schema)
		await this.internalDb.open()

		this.tables = models.reduce((tables,modelType) => {
			tables[modelType.name] = this.internalDb.table(modelType.name)
			return tables
		},{})


		return this.coordinator
		
		
	}

	async stop():Promise<ICoordinator> {
		if (this.internalDb)
			await this.internalDb.close()

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
		
		plugin = new IndexedDBRepoPlugin(this,repo)
		return plugin.repo as T
	}
}