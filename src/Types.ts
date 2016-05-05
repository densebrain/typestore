import Promise from './Promise'

export interface IModelClass {
	prototype:any
}

export interface IAttributeOptions {
	name?:string
	type?:any
	partitionKey?:boolean
	sortKey?:boolean
}

export interface IModelOptions {
	clazzName?:string
	clazz?:any
	tableName:string
	attrs?:IAttributeOptions[]
}

export interface IModelKey {

}

export interface IModelRepo<M extends IModelClass,K extends IModelKey> {
	key(...args):K
	get(key:K):Promise<M>
	create(o:M):Promise<M>
	update(o:M):Promise<M>
	remove(key:K):Promise<M>
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
	getModelRepo<T>(clazz:{new(): T; }):T
}

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
