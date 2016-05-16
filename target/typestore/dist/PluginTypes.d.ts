import 'reflect-metadata';
import './Globals';
import { IModel, IModelType } from "./ModelTypes";
import { Repo } from "./Repo";
import { ICoordinator, ICoordinatorOptions } from "./Types";
import { IModelKey, IKeyValue } from "./decorations/ModelDecorations";
/**
 * Model persistence events
 */
export declare enum PluginEventType {
    RepoInit = 1,
    ModelRegister = 2,
}
/**
 * Indexer options
 */
export interface IIndexOptions {
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
    index<M extends IModel>(type: IndexAction, options: IIndexOptions, modelType: IModelType, repo: Repo<M>, ...models: IModel[]): Promise<boolean>;
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
}
/**
 * Custom external search provider
 */
export interface ISearchProvider extends IRepoSupportPlugin {
    search<R extends any>(modelType: IModelType, opts: ISearchOptions<R>, ...args: any[]): Promise<R[]>;
}
export interface IModelSupportPlugin extends IPlugin {
    supportedModels: any[];
}
export interface IRepoSupportPlugin extends IModelSupportPlugin {
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
/**
 * Store interface that must be fulfilled for
 * a valid store to work
 */
export interface IStorePlugin extends IRepoSupportPlugin {
    syncModels(): Promise<ICoordinator>;
}
export interface IFinderPlugin extends IModelSupportPlugin {
    decorateFinder(repo: Repo<any>, finderKey: string): any;
}
export interface IRepoPlugin<M extends IModel> extends IModelSupportPlugin {
    key?(...args: any[]): IKeyValue;
    get(key: IKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: IKeyValue): Promise<any>;
    count(): Promise<number>;
}
export declare enum PluginType {
    Indexer = 1,
    Store = 2,
    Repo = 4,
    Finder = 8,
}
export interface IPlugin {
    type: PluginType;
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
}
