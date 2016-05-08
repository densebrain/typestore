import 'reflect-metadata'
import Promise = require('./Promise')
import {Repo} from "./Repo";
import {NoReflectionMetataError} from "./Errors";


export interface IModel {
	clazzType:string
}

/**
 * Simple base model implementation
 * uses reflection to determine type
 */
export class DefaultModel implements IModel {
	get clazzType() {
		const type = Reflect.getOwnMetadata('design:type',this)
		if (!type)
			throw new NoReflectionMetataError('Unable to reflect type information')

		return type.name
	}
}

export interface IModelIndex {
	name:string
	isAlternateRangeKey?:boolean
	rangeKey?:string
}

export interface IModelAttributeOptions {
	name?:string
	type?:any
	hashKey?:boolean
	rangeKey?:boolean
	index?: IModelIndex
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

export interface IKeyValue {

}


export interface IRepoOptions {
	indexers?:IIndexer[]
}

export interface IFinderOptions {
	searchOptions?:ISearchOptions<any>
}

/**
 * Responsible for indexing given models
 */
export interface IIndexer {

	/**
	 * Called in persistence chain after put/save
	 * before return.
	 * 
	 * Note: indexing can be done asynchronously based on your
	 * requirements, but we suggest whenever possible to do this sync
	 * 
	 * Obviously if you have a high write throughput solution
	 * THIS IS A BAD IDEA - do indexing async or offline
	 * 
	 * @param modelType
	 * @param model
	 * @param store
	 */
	index(modelType:IModelType,model:IModel,store:IStore):Promise<boolean>
}

/**
 * Maps search results to keys for a given repo
 */
export type ISearchResultToKeyMapper<R> = (repo:Repo<any>,resultType:{new():R},result:R) => IModelKey

/**
 * Super simply default key mapper for search results
 * field names in, key out, must all be top level in result object
 * 
 * @param fields
 * @returns {function(Repo<any>, {new(): R}, R): IModelKey}
 * @constructor
 */
export function DefaultKeyMapper<R extends any>(...fields):ISearchResultToKeyMapper<R> {
	return function (repo:Repo<any>,resultType:{new():R},result:R):IModelKey {
		const values = fields.map((field) => result[field])
		return repo.key(values)
	}
}

/**
 * Custom search options for search(s)
 */
export interface ISearchOptions<R extends any> {
	resultType:{new():R}
	resultKeyMapper: ISearchResultToKeyMapper<R>
	provider: ISearchProvider
}

/**
 * Custom external search provider
 */
export interface ISearchProvider {
	search<R extends any>(modelType:IModelType,opts:ISearchOptions<R>,...args):Promise<R[]>
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
	getRepo<T extends Repo<M>,M extends IModel>(clazz:{new(): T; }):T
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
	autoRegisterModels?: boolean
}

/**
 * Manager options default implementation
 */
export class ManagerOptions implements IManagerOptions {

	/**
	 * Default manager options
	 * 
	 * @type {{autoRegisterModules: boolean, syncStrategy: SyncStrategy, immutable: boolean}}
	 */
	static Defaults = {
		autoRegisterModules:true,
		syncStrategy: SyncStrategy.None,
		immutable: false
	}
	
	constructor(public store:IStore,opts = {}) {
		Object.assign(this,opts,ManagerOptions.Defaults)
	}
}


/**
 * Mapper interface for transforming objects back and forth between json
 * and their respective models
 */
export interface IModelMapper<M extends IModel> {
	toObject(o:M):Object
	toJson(o:M):string
	fromObject(json:Object):M
	fromJson(json:string):M
}

/**
 * Model definition
 */
export interface IModelType {
	options:IModelOptions
	name:string
	clazz:any
}


/**
 * Manager interface for store provider development
 * and end user management
 *
 * TODO: Rename coordinator
 */
export interface IManager {
	getOptions():IModelOptions
	getModels():IModelType[]
	getModel(clazz:any):IModelType
	getModelByName(name:string)
	start(...models):Promise<boolean>
	init(opts:IManagerOptions):Promise<boolean>
	reset():Promise<void>
	getRepo<T extends Repo<M>,M extends IModel>(clazz:{new(): T; }):T
	getMapper<M extends IModel>(clazz:{new():M;}):IModelMapper<M>
}


