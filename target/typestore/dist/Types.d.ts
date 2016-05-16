import 'reflect-metadata';
import { Repo } from "./Repo";
import { IModel, IModelType } from "./ModelTypes";
import { IIndexOptions, IPlugin } from "./PluginTypes";
export * from './ModelTypes';
export * from './PluginTypes';
/**
 * Options for repo decorations
 */
export interface IRepoOptions {
    indexes?: IIndexOptions[];
}
/**
 * Options for finder decorations
 */
export interface IFinderOptions {
    optional?: boolean;
}
/**
 * Simple base model implementation
 * uses reflection to determine type
 */
export declare class DefaultModel implements IModel {
    readonly clazzType: any;
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
 * Coordinator configuration, this is usually extend
 * by individual store providers
 */
export interface ICoordinatorOptions {
    immutable?: boolean;
    syncStrategy?: SyncStrategy;
    autoRegisterModels?: boolean;
}
/**
 * Coordinator options default implementation
 */
export declare class CoordinatorOptions implements ICoordinatorOptions {
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
    constructor(opts?: {});
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
 * Coordinator interface for store provider development
 * and end user management
 *
 * TODO: Rename coordinator
 */
export interface ICoordinator {
    getOptions(): ICoordinatorOptions;
    getModels(): IModelType[];
    getModel(clazz: any): IModelType;
    getModelByName(name: string): any;
    start(...models: any[]): Promise<ICoordinator>;
    init(opts: ICoordinatorOptions, ...plugins: IPlugin[]): Promise<ICoordinator>;
    reset(): Promise<ICoordinator>;
    getRepo<T extends Repo<M>, M extends IModel>(clazz: {
        new (): T;
    }): T;
}
