import {
	IRepoPlugin,
	IKeyValue,
	PluginType,
	IModel,
	Repo,
	ICoordinator,
	ICoordinatorOptions,
	PluginEventType,
	IFinderPlugin,
	getMetadata,
	IModelMapper,
	ModelPersistenceEventType,
	TKeyValue,
	Log
} from 'typestore'

import {IndexedDBPlugin} from "./IndexedDBPlugin";
import Dexie from "dexie";
import {IndexedDBFinderKey} from "./IndexedDBConstants";
import {IIndexedDBFinderOptions} from './IndexedDBDecorations'

const log = Log.create(__filename)

/**
 * Super simple plain jain key for now
 * what you send to the constructor comes out the
 * other end
 *
 * just like poop!
 */
export class IndexedDBKeyValue implements IKeyValue {

	public args:any[]

	indexedDBKey = true

	constructor(...args:any[]) {
		this.args = args
	}
}

export class IndexedDBRepoPlugin<M extends IModel> implements IRepoPlugin<M>, IFinderPlugin {

	type = PluginType.Repo | PluginType.Finder
	supportedModels:any[]

	private coordinator
	private keys:string[]

	/**
	 * Construct a new repo/store
	 * manager for a given repo/model
	 *
	 * @param store
	 * @param repo
	 */
	constructor(private store:IndexedDBPlugin, public repo:Repo<M>) {
		this.supportedModels = [repo.modelClazz]
		this.keys = repo.modelType.options.attrs
			.filter(attr => attr.primaryKey || attr.secondaryKey)
			.map(attr => attr.name)


		repo.attach(this)
	}

	/**
	 * Create a finder method with descriptor
	 * and signature
	 *
	 * @param repo
	 * @param finderKey
	 * @returns {any}
	 */
	decorateFinder(repo:Repo<any>, finderKey:string) {
		const finderOpts = getMetadata(
			IndexedDBFinderKey,
			this.repo,
			finderKey
		) as IIndexedDBFinderOptions

		if (!finderOpts)
			return null

		const {fn, filter} = finderOpts
		if (!fn && !filter)
			throw new Error('finder or fn properties MUST be provided on an indexeddb finder descriptor')

		return async(...args) => {

			let results = await ((fn) ? fn(this, ...args) : this.table
				.filter(record => filter(record, ...args))
				.toArray())


			const mapper = this.mapper

			const mappedResults = results.map(record => mapper.fromObject(record))
			return finderOpts.singleResult ? mappedResults[0] : mappedResults
		}
	}

	/**
	 * Handle a plugin event
	 *
	 * @param eventType
	 * @param args
	 * @returns {boolean}
	 */
	handle(eventType:PluginEventType, ...args):boolean|any {
		return false;
	}

	/**
	 * Model mapper
	 *
	 * @returns {IModelMapper<M>}
	 */
	get mapper():IModelMapper<M> {
		return this.repo.getMapper(this.repo.modelClazz)
	}

	/**
	 * Get dexie table
	 *
	 * @returns {Dexie.Table<any, any>}
	 */
	get table():Dexie.Table<any,any> {
		return this.store.table(this.repo.modelType)
	}

	/**
	 * Get db ref
	 *
	 * @returns {Dexie}
	 */
	get db() {
		return this.store.db
	}


	async init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		return (this.coordinator = coordinator)
	}

	async start():Promise<ICoordinator> {
		return this.coordinator
	}

	async stop():Promise<ICoordinator> {
		return this.coordinator
	}

	key(...args):IndexedDBKeyValue {
		return new IndexedDBKeyValue(...args);
	}

	keyFromObject(o:any):IndexedDBKeyValue {
		return new IndexedDBKeyValue(...this.keys.map(key => o[key]))
	}

	dbKeyFromKey(key:IndexedDBKeyValue) {
		return key.args[0]
	}

	async get(key:IndexedDBKeyValue):Promise<M> {
		key = key.indexedDBKey ? key : this.key(key as any)


		const dbObjects = await this.table
			.filter(record => {

				const recordKey = this.keyFromObject(record)
				return Array.isEqual(key.args, recordKey.args)
			})
			.toArray()

		if (dbObjects.length === 0)
			return null
		else if (dbObjects.length > 1)
			throw new Error(`More than one database object returned for key: ${JSON.stringify(key.args)}`)

		return this.repo.getMapper(this.repo.modelClazz).fromObject(dbObjects[0])


	}

	async save(model:M):Promise<M> {
		const mapper = this.mapper
		const json = mapper.toObject(model)

		try {
			await this.table.put(json)
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Save, model)
		} catch (err) {
			log.error('Failed to persist model',err)
			log.error('Failed persisted json',json,model)

			throw err
		}
		return model
	}

	/**
	 * Remove implementation
	 *
	 * @param key
	 * @returns {Promise<void>}
	 */
	async remove(key:IndexedDBKeyValue):Promise<any> {
		key = key.indexedDBKey ? key : this.key(key as any)

		const model = (this.repo.supportPersistenceEvents()) ?
			await this.get(key) : null

		const result = await this.table.delete(key.args[0])

		if (model)
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Remove,model)

		return Promise.resolve(result);
	}

	count():Promise<number> {
		return Promise.resolve(this.table.count());
	}

	/**
	 * Bulk get
	 *
	 * @param keys
	 * @returns {any}
	 */
	async bulkGet(...keys:IndexedDBKeyValue[]):Promise<M[]> {
		keys = keys.map(key => (key.indexedDBKey) ? key : this.key(key as any))

		const promises = keys.map(key => this.get(key))
		return await Promise.all(promises)
	}

	/**
	 * Bulk save/put
	 *
	 * @param models
	 * @returns {M[]}
	 */
	async bulkSave(...models:M[]):Promise<M[]> {
		const mapper = this.repo.getMapper(this.repo.modelClazz)
		const jsons = models.map(model => mapper.toObject(model))

		await this.table.bulkPut(jsons)
		this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Save,...models)

		return models
	}

	/**
	 * Bulk remove
	 *
	 * @param keys
	 * @returns {IndexedDBKeyValue[]}
	 */
	async bulkRemove(...keys:IndexedDBKeyValue[]):Promise<any[]> {
		keys = keys.map(key => (key.indexedDBKey) ? key : this.key(key as any))

		const models = (this.repo.supportPersistenceEvents()) ?
			await this.bulkGet(...keys) : null

		const dbKeys = keys.map(key => this.dbKeyFromKey(key))

		await this.table.bulkDelete(dbKeys)

		if (models)
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Remove,...models)

		return keys
	}
}