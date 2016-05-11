import 'reflect-metadata';
import Promise = require('./Promise');
import { Repo } from "./Repo";
export interface IModel {
    clazzType: string;
}
/**
 * Simple base model implementation
 * uses reflection to determine type
 */
export declare class DefaultModel implements IModel {
    clazzType: any;
}
export interface IModelIndex {
    name: string;
    isAlternateRangeKey?: boolean;
    rangeKey?: string;
}
export interface IModelAttributeOptions {
    name?: string;
    type?: any;
    hashKey?: boolean;
    rangeKey?: boolean;
    index?: IModelIndex;
}
/**
 * Options provided to model
 * decorator annotation
 */
export interface IModelOptions {
    clazzName?: string;
    clazz?: any;
    tableName: string;
    attrs?: IModelAttributeOptions[];
}
export interface IModelKey {
}
export interface IKeyValue {
}
export interface IIndexerOptions {
    indexer: IIndexer;
    fields: string[];
}
export interface IRepoOptions {
    indexers?: IIndexerOptions[];
}
export interface IFinderOptions {
    searchOptions?: ISearchOptions<any>;
}
export declare enum IndexType {
    Add = 0,
    Update = 1,
    Remove = 2,
}
/**
 * Responsible for indexing given models
 */
export interface IIndexer extends IPlugin {
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
    index<M extends IModel>(type: IndexType, options: IIndexerOptions, modelType: IModelType, repo: Repo<M>, ...models: IModel[]): Promise<boolean>;
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
export interface IStore extends IPlugin {
    init(manager: IManager, opts: IManagerOptions): Promise<boolean>;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    syncModels(): Promise<boolean>;
    prepareRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
/**
 * Sync strategy for updating models in the store
 */
export declare enum SyncStrategy {
    Overwrite = 0,
    Update = 1,
    None = 2,
}
export declare namespace SyncStrategy {
    const toString: (strategy: SyncStrategy) => string;
}
/**
 * Manager configuration, this is usually extend
 * by individual store providers
 */
export interface IManagerOptions {
    immutable?: boolean;
    syncStrategy?: SyncStrategy;
    autoRegisterModels?: boolean;
}
/**
 * Manager options default implementation
 */
export declare class ManagerOptions implements IManagerOptions {
    store: IStore;
    /**
     * Default manager options
     *
     * @type {{autoRegisterModules: boolean, syncStrategy: SyncStrategy, immutable: boolean}}
     */
    static Defaults: {
        autoRegisterModules: boolean;
        syncStrategy: SyncStrategy;
        immutable: boolean;
    };
    constructor(store: IStore, opts?: {});
}
/**
 * Mapper interface for transforming objects back and forth between json
 * and their respective models
 */
export interface IModelMapper<M extends IModel> {
    toObject(o: M): Object;
    toJson(o: M): string;
    fromObject(json: Object): M;
    fromJson(json: string): M;
}
/**
 * Model definition
 */
export interface IModelType {
    options: IModelOptions;
    name: string;
    clazz: any;
}
export declare enum PluginType {
    Indexer = 0,
    Store = 1,
}
export interface IPlugin {
    type: PluginType;
}
/**
 * Manager interface for store provider development
 * and end user management
 *
 * TODO: Rename coordinator
 */
export interface IManager {
    getOptions(): IModelOptions;
    getModels(): IModelType[];
    getModel(clazz: any): IModelType;
    getModelByName(name: string): any;
    start(...models: any[]): Promise<IManager>;
    init(opts: IManagerOptions, ...plugins: IPlugin[]): Promise<IManager>;
    reset(): Promise<IManager>;
    getRepo<T extends Repo<M>, M extends IModel>(clazz: {
        new (): T;
    }): T;
    getMapper<M extends IModel>(clazz: {
        new (): M;
    }): IModelMapper<M>;
}
