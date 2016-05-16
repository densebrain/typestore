/// <reference path="../typings/typestore-plugin-cloudsearch.d.ts" />
import { IIndexerPlugin, IndexAction, IIndexOptions, ISearchProvider, IModelType, IModel, ISearchOptions, Repo, ICoordinator, ICoordinatorOptions, PluginEventType } from 'typestore';
import { ICloudSearchOptions } from "./CloudSearchTypes";
import { IFinderPlugin } from "../../typestore/src/PluginTypes";
/**
 * Create a cloud search provider plugin
 */
export declare class CloudSearchProviderPlugin implements IIndexerPlugin, IFinderPlugin, ISearchProvider {
    private options;
    type: number;
    supportedModels: any[];
    private client;
    private endpoint;
    private awsOptions;
    private typeField;
    private coordinator;
    /**
     * Create a new AWS CloudSearch Provider
     *
     * @param options
     * @param supportedModels
     */
    constructor(options: ICloudSearchOptions, ...supportedModels: any[]);
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    /**
     * Called to start the plugin
     *
     * @returns {any}
     */
    start(): Promise<ICoordinator>;
    /**
     * Called to stop the plugin
     *
     * @returns {any}
     */
    stop(): Promise<ICoordinator>;
    /**
     * Indexing action pushing documents to CloudSearch
     *
     * @param type
     * @param options
     * @param modelType
     * @param repo
     * @param models
     * @returns {boolean}
     */
    index<M extends IModel>(type: IndexAction, options: IIndexOptions, modelType: IModelType, repo: Repo<M>, ...models: IModel[]): Promise<boolean>;
    /**
     * This needs to implemented a bit cleaner ;)
     *
     * Currently all args are just joined
     * with spaces and jammed into the query field
     *
     * @param modelType
     * @param opts
     * @param args
     * @returns {any}
     */
    search<R extends any>(modelType: IModelType, opts: ISearchOptions<R>, ...args: any[]): Promise<R[]>;
    /**
     * Create a cloud search finder if decorated
     *
     * @param repo
     * @param finderKey
     * @returns {function(...[any]): Promise<Promise<any>[]>}
     */
    decorateFinder(repo: Repo<any>, finderKey: string): (...args: any[]) => Promise<Promise<any>[]>;
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
