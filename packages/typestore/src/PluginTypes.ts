import 'reflect-metadata'
import './Globals'
import BBPromise = require('./Promise')
import {IKeyValue, IModel, IModelType, IModelKey} from "./ModelTypes";
import {Repo} from "./Repo";
import {ICoordinator, ICoordinatorOptions} from "./Types";


/**
 * Model persistence events
 */
export enum ModelEvent {
	PreSave,
	PostSave,
	
	PreRemove,
	PostRemove
}


/**
 * Indexer options
 */
export interface IIndexerOptions {
	indexer:IIndexerPlugin,
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
export interface IIndexerPlugin extends IPlugin {

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
	index<M extends IModel>(type:IndexAction, options:IIndexerOptions, modelType:IModelType, repo:Repo<M>, ...models:IModel[]):BBPromise<boolean>
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
export interface ISearchProvider extends IPlugin {
	search<R extends any>(modelType:IModelType,opts:ISearchOptions<R>,...args):BBPromise<R[]>
}


/**
 * Store interface that must be fulfilled for
 * a valid store to work
 */
export interface IStorePlugin extends IPlugin {
	init(coordinator:ICoordinator, opts:ICoordinatorOptions):BBPromise<ICoordinator>
	start():BBPromise<ICoordinator>
	stop():BBPromise<ICoordinator>
	syncModels():BBPromise<ICoordinator>
	initRepo<T extends Repo<M>,M extends IModel>(repo:T):T
}

export interface IFinderPlugin extends IPlugin {
	decorateFinder(repo:Repo<any>,finderKey:string)
}

export interface IRepoPlugin<M extends IModel> extends IPlugin {
	key?(...args):IKeyValue
	get(key:IKeyValue):BBPromise<M>
	save(o:M):BBPromise<M>
	remove(key:IKeyValue):BBPromise<any>
	count():BBPromise<number>
}



export enum PluginType {
	Indexer,
	Store,
	Repo,
	Finder
}

export interface IPlugin {
	type:PluginType

	/**
	 * Repo event pipeline
	 *
	 * @param event - type of event being called
	 * @param model - the model the event applies to
	 *
	 * @return BBPromise<M> a BBPromise to complete the event handling
	 */
	handleModelEvent?<M extends IModel>(event:ModelEvent,model:M):BBPromise<M>
}