/// <reference path="../node_modules/aws-sdk-typescript/output/typings/aws-config.d.ts" />
import { IIndexerPlugin, IndexAction, IIndexerOptions, ISearchProvider, IModelType, IModel, PluginType, ISearchOptions, Repo, ICoordinator, ICoordinatorOptions, PluginEventType } from 'typestore';
import { ICloudSearchOptions } from "./CloudSearchTypes";
export declare class CloudSearchProvider implements IIndexerPlugin, ISearchProvider {
    private options;
    type: PluginType;
    private client;
    private endpoint;
    private awsOptions;
    private typeField;
    private coordinator;
    private supportedModels;
    /**
     * Create a new AWS CloudSearch Provider
     *
     * @param options
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
    index<M extends IModel>(type: IndexAction, options: IIndexerOptions, modelType: IModelType, repo: Repo<M>, ...models: IModel[]): Promise<boolean>;
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
}
