

import {
	IRepoPlugin,
	IKeyValue,
	PluginType,
	IModel,
	Repo,
	ICoordinator,
	ICoordinatorOptions
} from 'typestore'

import {IndexedDBPlugin} from "./IndexedDBPlugin";
import Dexie from "dexie";



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

export class IndexedDBRepoPlugin<M extends IModel> implements IRepoPlugin<M> {

	type = PluginType.Repo

	private coordinator
	private keys:string[]

	constructor(private store:IndexedDBPlugin, public repo:Repo<M>) {
		this.keys = repo.modelType.options.attrs
			.filter(attr => attr.primaryKey || attr.secondaryKey)
			.map(attr => attr.name)
		repo.attach(this)
		
		
	}

	get table():Dexie.Table<any,any> {
		return this.store.table(this.repo.modelType)
	}


	async init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		return (this.coordinator = coordinator)
	}

	async start():Promise<ICoordinator> {
		return null;
	}

	async stop():Promise<ICoordinator> {
		return null;
	}

	key(...args):IndexedDBKeyValue {
		return new IndexedDBKeyValue(...args);
	}

	keyFromObject(o:any):IndexedDBKeyValue {
		return new IndexedDBKeyValue(...this.keys.map(key => o[key]))
	}

	async get(key:IndexedDBKeyValue):Promise<M> {
		const dbObjects = await this.table
			.filter(record => {

				const recordKey = this.keyFromObject(record)
				const matched = Array.arraysEqual(key.args,recordKey.args)
				return matched
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
}