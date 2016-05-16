import { IModel, IFinderOptions, IndexAction, IRepoOptions, ISearchProvider, IPlugin, IModelMapper, ISearchOptions, IRepoPlugin, IFinderPlugin } from "./Types";
import { Coordinator } from './Coordinator';
import { IModelType } from "./ModelTypes";
import { IModelOptions, IKeyValue } from "./decorations/ModelDecorations";
/**
 * The core Repo implementation
 *
 * When requested from the coordinator,
 * it offers itself to all configured plugins for
 * them to attach to the model pipeline
 *
 *
 */
export declare class Repo<M extends IModel> {
    repoClazz: any;
    modelClazz: {
        new (): M;
    };
    modelOpts: IModelOptions;
    repoOpts: IRepoOptions;
    modelType: IModelType;
    mapper: any;
    coordinator: Coordinator;
    protected plugins: IPlugin[];
    /**
     * Core repo is instantiated by providing the implementing/extending
     * class and the model that will be supported
     *
     * @param repoClazz
     * @param modelClazz
     */
    constructor(repoClazz: any, modelClazz: {
        new (): M;
    });
    init(coordinator: any): void;
    start(): void;
    getMapper<M extends IModel>(clazz: {
        new (): M;
    }): IModelMapper<M>;
    protected getRepoPlugins(): IRepoPlugin<M>[];
    protected getFinderPlugins(): IFinderPlugin[];
    /**
     * Attach a plugin to the repo - could be a store,
     * indexer, etc, etc
     *
     * @param plugin
     * @returns {Repo}
     */
    attach(plugin: IPlugin): this;
    getFinderOptions(finderKey: string): IFinderOptions;
    decorateFinders(): void;
    /**
     * Create a generic finder, in order
     * to do this search options must have been
     * annotated on the model
     *
     * @param finderKey
     * @param searchProvider
     * @param searchOpts
     * @returns {any}
     */
    makeGenericFinder(finderKey: string, searchProvider: ISearchProvider, searchOpts: ISearchOptions<any>): (...args: any[]) => Promise<Promise<M>[]>;
    /**
     * Set a finder function on the repo
     *
     * @param finderKey
     * @param finderFn
     */
    protected setFinder(finderKey: string, finderFn: (...args) => any): void;
    /**
     * Call out to the indexers
     *
     * @param type
     * @param models
     * @returns {Bluebird<boolean>}
     */
    index(type: IndexAction, ...models: IModel[]): Promise<boolean>;
    indexPromise(action: IndexAction): (models: M[]) => Promise<M[]>;
    /**
     * Not implemented
     *
     * @param args
     * @returns {null}
     */
    key(...args: any[]): IKeyValue;
    /**
     * Get one or more models with keys
     *
     * @param key
     * @returns {null}
     */
    get(key: IKeyValue): Promise<M>;
    /**
     * Save model
     *
     * @param o
     * @returns {null}
     */
    save(o: M): Promise<M>;
    /**
     * Remove a model
     *
     * @param key
     * @returns {null}
     */
    remove(key: IKeyValue): Promise<any>;
    /**
     * Count models
     *
     * @returns {null}
     */
    count(): Promise<number>;
}
