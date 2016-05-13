

import {
	Promise as BBPromise,
	IRepoPlugin,
	IKeyValue,
	PluginType,
	IModel,
	Repo
} from 'typestore'

import {LocalStoragePlugin} from "./LocalStoragePlugin";
import Dexie from "dexie";


/**
 * Super simple plain jain key for now
 * what you send to the constructor comes out the 
 * other end
 * 
 * just like poop!
 */
export class LocalStorageKeyValue implements IKeyValue {

	public args:any[]
	constructor(...args:any[]) {
		this.args = args
	}
}

export class LocalStorageRepoPlugin<M extends IModel> implements IRepoPlugin<M> {

	private keys:string[]
	constructor(private store:LocalStoragePlugin,public repo:Repo<M>) {
		this.keys = repo.modelType.options.attrs
			.filter(attr => attr.hashKey || attr.rangeKey)
			.map(attr => attr.name)
		repo.attach(this)
		
		
	}

	/**
	 * PluginType.Repo
	 */
	get type() {
		return PluginType.Repo
	}
	
	get table():Dexie.Table<any,any> {
		return this.store.table(this.repo.modelType)
	}
	
	key(...args):LocalStorageKeyValue {
		return new LocalStorageKeyValue(...args);
	}

	keyFromObject(o:any):LocalStorageKeyValue {
		return new LocalStorageKeyValue(this.keys.map(key => o[key]))
	}

	get(key:LocalStorageKeyValue):BBPromise<M> {
		return BBPromise.resolve(
			this.table
				.filter(record => {
					const recordKey = this.keyFromObject(record).args
					return key.args.equals(recordKey)
				})
				.toArray()
				.then(dbObjects => {
					if (dbObjects.length === 0)
						return null
					else if (dbObjects.length > 0)
						throw new Error(`More than one database object returned for key: ${JSON.stringify(key.args)}`)

					return this.repo.getMapper(this.repo.modelClazz)
						.fromObject(dbObjects[0])
				})
		)
	}

	save(o:M):BBPromise<M> {
		return BBPromise.resolve(this.table.add(o))
			.return(o) as BBPromise<M>
	}

	// FIXME: Need to implement key support - tests are more important 
	remove(key:LocalStorageKeyValue):BBPromise<any> {
		return BBPromise.resolve(this.table.delete(key.args[0]));
	}

	count():BBPromise<number> {
		return BBPromise.resolve(this.table.count());
	}
}