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
	IModelMapper
} from 'typestore'

import {IndexedDBPlugin} from "./IndexedDBPlugin";
import Dexie from "dexie";
import {IndexedDBFinderKey} from "./IndexedDBConstants";
import {IIndexedDBFinderOptions} from './IndexedDBDecorations'


/**
 * Super simple plain jain key for now
 * what you send to the constructor comes out the
 * other end
 *
 * just like poop!
 */
export class IndexedDBKeyValue implements IKeyValue {

	public args:any[]

	constructor(...args:any[]) {
		this.args = args
	}
}

export class IndexedDBRepoPlugin<M extends IModel> implements IRepoPlugin<M>, IFinderPlugin {

	type = PluginType.Repo | PluginType.Finder
	supportedModels:any[]

	private coordinator
	private keys:string[]

	constructor(private store:IndexedDBPlugin, public repo:Repo<M>) {
		this.supportedModels = [repo.modelClazz]
		this.keys = repo.modelType.options.attrs
			.filter(attr => attr.primaryKey || attr.secondaryKey)
			.map(attr => attr.name)
		repo.attach(this)
	}

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

			return results.map(record => mapper.fromObject(record))
		}
	}

	handle(eventType:PluginEventType, ...args):boolean|any {
		return false;
	}

	get mapper():IModelMapper<M> {
		return this.repo.getMapper(this.repo.modelClazz)
	}

	get table():Dexie.Table<any,any> {
		return this.store.table(this.repo.modelType)
	}

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
		const dbObjects = await this.table
			.filter(record => {

				const recordKey = this.keyFromObject(record)
				return Array.arraysEqual(key.args, recordKey.args)
			})
			.toArray()

		if (dbObjects.length === 0)
			return null
		else if (dbObjects.length > 1)
			throw new Error(`More than one database object returned for key: ${JSON.stringify(key.args)}`)

		return this.repo.getMapper(this.repo.modelClazz).fromObject(dbObjects[0])


	}

	async save(o:M):Promise<M> {
		const json = this.repo.getMapper(this.repo.modelClazz).toObject(o)
		await this.table.add(json)
		return o
	}

	// FIXME: Need to implement key support - tests are more important
	remove(key:IndexedDBKeyValue):Promise<any> {
		return Promise.resolve(this.table.delete(key.args[0]));
	}

	count():Promise<number> {
		return Promise.resolve(this.table.count());
	}

	async bulkGet(...keys:IndexedDBKeyValue[]):Promise<M[]> {
		const promises = keys.map(key => this.get(key))
		return await Promise.all(promises)
	}

	async bulkSave(...models:M[]):Promise<M[]> {
		const mapper = this.repo.getMapper(this.repo.modelClazz)
		const jsons = models.map(model => mapper.toObject(model))

		//await this.db.transaction('rw',this.table,async () => {
		await this.table.bulkAdd(jsons)
		//})
		return models
	}

	async bulkRemove(...keys:IndexedDBKeyValue[]):Promise<any[]> {
		const dbKeys = keys.map(key => this.dbKeyFromKey(key))
		//await this.db.transaction('rw',this.table,async () => {
		await this.table.bulkDelete(dbKeys)
		//})
		//const promises = keys.map(key => this.remove(key))
		return keys
	}
}