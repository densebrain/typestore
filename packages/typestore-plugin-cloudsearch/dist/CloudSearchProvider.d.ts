/// <reference path="../packages/typestore-plugin-cloudsearch/node_modules/aws-sdk-typescript/output/typings/aws-config.d.ts" />
import { Promise, IIndexerPlugin, IndexAction, IIndexerOptions, ISearchProvider, IModelType, IModel, PluginType, ISearchOptions, Repo } from 'typestore';
export declare class CloudSearchProvider implements IIndexerPlugin, ISearchProvider {
    private endpoint;
    private awsOptions;
    private client;
    constructor(endpoint: string, awsOptions?: any);
    type: PluginType;
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
