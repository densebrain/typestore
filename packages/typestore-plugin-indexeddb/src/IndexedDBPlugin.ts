

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
	repoAttachIfSupported,
	IModelAttributeOptions
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
    version?:number
}

/**
 * Default options
 */
export const LocalStorageOptionDefaults = {
	databaseName: 'typestore-db',
	version: 1
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

	private newDexie() {
		return new Dexie(this.opts.databaseName,this.opts.provider)
	}

	private open() {
		this.internalDb = this.newDexie()
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

		// 1. Create the current schema config
		// TODO: Should only use indexed attributes for schema
		const schemaAttrNameMap = {}
		const schema:{[key:string]:string} = models.reduce((newSchema,modelType) => {

			// Get all the known attributes for the table
			const attrs = modelType.options.attrs
				.filter(attr => !attr.transient)

			schemaAttrNameMap[modelType.name] = attrs.map(attr => attr.name)
			const attrDescs = attrs.map((attr:IModelAttributeOptions) => {
				const
					{index,name,primaryKey} = attr,
					unique = primaryKey || (index && index.unique),
					prefix = (unique) ? '&' : ''

				return `${prefix}${name}`
			})
				// Added the attribute descriptor to the new schema
			newSchema[modelType.name] = attrDescs.join(',')
			log.debug(`Created schema for ${modelType.name}`,newSchema[modelType.name])
			return newSchema
		},{})

		// Check for an existing database, version, schema
		let {version} = this.opts
		await new Promise((resolve,reject) => {
			const db = this.newDexie()
			db.open()
				.then(() => {
					log.info('Opened existing database', db.name,' with existing version ', db.verno)

					const
						tables = db.tables,
						tableNames = tables.map(table => table.name),
						newTableNames = Object.keys(schema),

						// New table defined
						newTable = !newTableNames.every(tableName => tableNames.includes(tableName)),

						// Table removed??
						removedTable = !tableNames.every(tableName => newTableNames.includes(tableName))

					let attrChanged = false

					// If no new tables then check indexes
					if (!newTable && !removedTable) {
						for (let table of tables) {
							const
								newAttrNames = schemaAttrNameMap[table.name],
								{indexes,primKey} = table.schema,
								oldAttrNames = indexes.map(index => index.name).concat([primKey.name])


							if (newAttrNames.length !== oldAttrNames.length || !oldAttrNames.every(attrName => newAttrNames.includes(attrName))) {
								log.info('Attributes have changed on table, bumping version.  New attrs ', newAttrNames, ' old attr names ', oldAttrNames)
								attrChanged = true
								break
							}
						}
					}

					if (attrChanged || newTable || removedTable) {
						log.info('Schema changes detected, bumping version, everntually auto-upgrade',attrChanged,newTable,removedTable)
						version = db.verno + 1
					}

					log.debug('Closing db check')
					db.close()
					resolve(true)

				})
				.catch('NoSuchDatabaseError', (e) => {
					log.info('Database does not exist, creating: ',this.opts.databaseName)
					resolve(false)
				})
				.catch((e) => {
					log.error ("Unknown error",e)
					reject(e)
				})
		})

		// Table needs to be created


		log.debug(`Creating schema`,schema)
		this.open()
			.version(version)
			.stores(schema)

		await new Promise((resolve,reject) => {
			this.internalDb.open().then(resolve).catch(reject)
		})

		this.tables = models.reduce((newTables,modelType) => {
			newTables[modelType.name] = this.internalDb.table(modelType.name)
			return newTables
		},{})

		log.debug('IndexedDB store is ready')
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