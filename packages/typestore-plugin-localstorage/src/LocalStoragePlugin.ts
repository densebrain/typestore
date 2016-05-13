
import Dexie from 'dexie'
import {
	Promise as BBPromise,
	ICoordinator,
	ICoordinatorOptions,
	Repo,
	IModel,
	PluginType,
	IStorePlugin,
	IModelType, 
	Log
} from 'typestore'
import {LocalStorageRepoPlugin} from "./LocalStorageRepoPlugin";


const log = Log.create(__filename)

/**
 * Options interface
 */
export interface ILocalStorageOptions {

	/**
	 * Database name for Dexie/indexdb
	 */
	databaseName?:string
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
export class LocalStoragePlugin implements IStorePlugin {


	private coordinator:ICoordinator
	private db:Dexie
	private repoPlugins:{[modelName:string]:LocalStorageRepoPlugin<any>} = {}
	private tables:{[tableName:string]:Dexie.Table<any,any>}
	
	constructor(private opts:ILocalStorageOptions = {}) {
		this.opts = Object.assign({},LocalStorageOptionDefaults,opts)
	}

	get type() {
		return PluginType.Store
	}
	
	table(modelType:IModelType):Dexie.Table<any,any> {
		let table = this.tables[modelType.name]
		if (!table)
			throw new Error(`Unable to find a table definition for ${modelType.name}`)
			
		
		return table
	}

	init(coordinator:ICoordinator, opts:ICoordinatorOptions):BBPromise<ICoordinator> {
		this.coordinator = coordinator
		return BBPromise.resolve(coordinator)
	}

	start():BBPromise<ICoordinator> {
		const models = this.coordinator.getModels()

		// Table needs to be created
		// TODO: Should only use indexed attributes for schema
		const schema:{[key:string]:string} = models.reduce((schema,modelType) => {
			schema[modelType.name] = modelType.options.attrs.map(attr => attr.name).join(',')
			return schema
		},{})
		
		this.db = new Dexie(this.opts.databaseName)
		this.db.version(1).stores(schema)
		return BBPromise.resolve(this.db.open())
			.then(() => {
				this.tables = models.reduce((tables,modelType) => {
					tables[modelType.name] = this.db.table(modelType.name)
					return tables
				},{})		
			})
			.return(this.coordinator)
		
		
		
		
	}

	stop():BBPromise<ICoordinator> {
		return BBPromise.resolve(this.db ? this.db.close() : this.db)
			.return(this.coordinator)
	}

	syncModels():BBPromise<ICoordinator> {
		log.debug('Currently the localstorage plugin does not sync models')
		return BBPromise.resolve(this.coordinator)
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
		
		plugin = new LocalStorageRepoPlugin(this,repo)
		return plugin.repo as T
	}
}