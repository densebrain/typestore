import 'reflect-metadata';
import Promise = require('./Promise');
import { IKeyValue, IModel, IModelType, IModelKey } from "./ModelTypes";
import { Repo } from "./Repo";
import { ICoordinator, ICoordinatorOptions } from "./Types";
/**
 * Model persistence events
 */
export declare enum ModelEvent {
    PreSave = 0,
    PostSave = 1,
    PreRemove = 2,
    PostRemove = 3,
}
/**
 * Indexer options
 */
export interface IIndexerOptions {
    indexer: IIndexerPlugin;
    fields: string[];
}
/**
 * Different indexing actions
 */
export declare enum IndexAction {
    Add = 0,
    Update = 1,
    Remove = 2,
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
    index<M extends IModel>(type: IndexAction, options: IIndexerOptions, modelType: IModelType, repo: Repo<M>, ...models: IModel[]): Promise<boolean>;
}
/**
 * Maps search results to keys for a given repo
 */
export declare type ISearchResultToKeyMapper<R> = (repo: Repo<any>, resultType: {
    new (): R;
}, result: R) => IModelKey;
/**
 * Super simply default key mapper for search results
 * field names in, key out, must all be top level in result object
 *
 * @param fields
 * @returns {function(Repo<any>, {new(): R}, R): IModelKey}
 * @constructor
 */
export declare function DefaultKeyMapper<R extends any>(...fields: any[]): ISearchResultToKeyMapper<R>;
/**
 * Custom search options for search(s)
 */
export interface ISearchOptions<R extends any> {
    resultType: {
        new (): R;
    };
    resultKeyMapper: ISearchResultToKeyMapper<R>;
    provider: ISearchProvider;
}
/**
 * Custom external search provider
 */
export interface ISearchProvider extends IPlugin {
    search<R extends any>(modelType: IModelType, opts: ISearchOptions<R>, ...args: any[]): Promise<R[]>;
}
/**
 * Store interface that must be fulfilled for
 * a valid store to work
 */
export interface IStorePlugin extends IPlugin {
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    syncModels(): Promise<ICoordinator>;
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
export interface IFinderPlugin extends IPlugin {
    decorateFinder(repo: Repo<any>, finderKey: string): any;
}
export interface IRepoPlugin<M extends IModel> extends IPlugin {
    key?(...args: any[]): IKeyValue;
    get(key: IKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: IKeyValue): Promise<any>;
    count(): Promise<number>;
}
export declare enum PluginType {
    Indexer = 0,
    Store = 1,
    Repo = 2,
    Finder = 3,
}
export interface IPlugin {
    type: PluginType;
    /**
     * Repo event pipeline
     *
     * @param event - type of event being called
     * @param model - the model the event applies to
     *
     * @return Promise<M> a promise to complete the event handling
     */
    handleModelEvent?<M extends IModel>(event: ModelEvent, model: M): Promise<M>;
}
