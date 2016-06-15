//import 'reflect-metadata'
import './Globals'
import {IModel, IModelType} from "./ModelTypes";
import {Repo} from "./Repo";
import {ICoordinator, ICoordinatorOptions} from "./Types";
import {IModelKey, IKeyValue, TKeyValue} from "./decorations/ModelDecorations";


/**
 * Model persistence events
 */
export enum PluginEventType {
	RepoInit = 1,
	ModelRegister
}


/**
 * Indexer options
 */
export interface IIndexOptions {
	fields:string[]
}

/**
 * Different indexing actions
 */
export enum IndexAction {
	Add,
	Update,
	Remove
}





/**
 * Responsible for indexing given models
 */
export interface IIndexerPlugin extends IRepoSupportPlugin {

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
	 * @param options
	 * @param modelType
	 * @param repo
	 */
	index<M extends IModel>(type:IndexAction, options:IIndexOptions, modelType:IModelType, repo:Repo<M>, ...models:IModel[]):Promise<boolean>
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
}

/**
 * Custom external search provider
 */
export interface ISearchProvider extends IRepoSupportPlugin {
	search<R extends any>(modelType:IModelType,opts:ISearchOptions<R>,...args):Promise<R[]>
}


/**
 * A plugin that supports specific models
 */
export interface IModelSupportPlugin extends IPlugin {
	supportedModels:any[]
}

/**
 * A plugin that provides repo capabilities
 */
export interface IRepoSupportPlugin extends IModelSupportPlugin {
	initRepo<T extends Repo<M>,M extends IModel>(repo:T):T
}

/**
 * Store interface that must be fulfilled for
 * a valid store to work
 */
export interface IStorePlugin extends IRepoSupportPlugin {
	syncModels():Promise<ICoordinator>
}

/**
 * Plugin that provides finders
 */
export interface IFinderPlugin extends IModelSupportPlugin {
	decorateFinder(repo:Repo<any>,finderKey:string)
}


export interface IRepoPlugin<M extends IModel> extends IModelSupportPlugin {
	key?(...args):IKeyValue
	get(key:TKeyValue):Promise<M>
	bulkGet(...keys:TKeyValue[]):Promise<M[]>
	save(o:M):Promise<M>
	bulkSave(...o:M[]):Promise<M[]>
	remove(key:TKeyValue):Promise<any>
	bulkRemove(...key:TKeyValue[]):Promise<any[]>
	count():Promise<number>
}



export enum PluginType {
	Indexer = 1 << 0,
	Store = 1 << 1,
	Repo = 1 << 2,
	Finder = 1 << 3
}

export interface IPlugin {
	type:PluginType

	handle(eventType:PluginEventType,...args:any[]):boolean|any
	init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator>
	start():Promise<ICoordinator>
	stop():Promise<ICoordinator>
}