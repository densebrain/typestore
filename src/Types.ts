import Promise = require('bluebird')

export interface IModelClass {

}

export interface IModelAttributeOptions {
	name?:string
	type?:any
	partitionKey?:boolean
	sortKey?:boolean
}

/**
 * Options provided to model
 * decorator annotation
 */
export interface IModelOptions {
	clazzName?:string
	clazz?:any
	tableName:string
	attrs?:IModelAttributeOptions[]
}

export interface IModelKey {

}


export interface IRepoOptions {

}

export interface IRepo<M extends IModelClass> {
	key(...args):IModelKey
	get(key:IModelKey):Promise<M>
	create(o:M):Promise<M>
	update(o:M):Promise<M>
	remove(key:IModelKey):Promise<M>
}



/**
 * Store interface that must be fulfilled for
 * a valid store to work
 */
export interface IStore {
	init(manager:IManager,opts:IManagerOptions):Promise<boolean>
	start():Promise<boolean>
	stop():Promise<boolean>
	syncModels():Promise<boolean>
	getRepo<T extends IRepo<any>>(clazz:{new(): T; }):T
}

/**
 * Sync strategy for updating models in the store
 */
export enum SyncStrategy {
	Overwrite,
	Update,
	None
}

export namespace SyncStrategy {
	export const toString = (strategy:SyncStrategy):string => {
		return SyncStrategy[strategy]
	}
}
/**
 * Manager configuration, this is usually extend
 * by individual store providers
 */

export interface IManagerOptions {
	store:IStore
	immutable?:boolean
	syncStrategy?: SyncStrategy

}


/**
 * Manager interface for store provider development
 * and end user management
 *
 * TODO: Rename coordinator
 */
export interface IManager {
	getModelRegistrations():IModelOptions[]
	findModelOptionsByClazz(clazz:any):IModelOptions
	start():Promise<boolean>
	init(opts:IManagerOptions):Promise<boolean>
	reset():Promise<void>
	store:IStore
}
