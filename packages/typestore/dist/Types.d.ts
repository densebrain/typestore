import Promise = require('./Promise');
import { Repo } from "./Repo";
export interface IModelClass {
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
export interface IRepoOptions {
}
/**
 * Store interface that must be fulfilled for
 * a valid store to work
 */
export interface IStore {
    init(manager: IManager, opts: IManagerOptions): Promise<boolean>;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    syncModels(): Promise<boolean>;
    getRepo<T extends Repo<M>, M extends any>(clazz: {
        new (): T;
    }): T;
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
    store: IStore;
    immutable?: boolean;
    syncStrategy?: SyncStrategy;
}
/**
 * Mapper interface for transforming objects back and forth between json
 * and their respective models
 */
export interface IModelMapper<M> {
    toObject(o: M): Object;
    toJson(o: M): string;
    fromObject(json: Object): M;
    fromJson(json: string): M;
}
/**
 * Manager interface for store provider development
 * and end user management
 *
 * TODO: Rename coordinator
 */
export interface IManager {
    getModelRegistrations(): IModelOptions[];
    findModelOptionsByClazz(clazz: any): IModelOptions;
    start(): Promise<boolean>;
    init(opts: IManagerOptions): Promise<boolean>;
    reset(): Promise<void>;
    getRepo<T extends Repo<M>, M>(clazz: {
        new (): T;
    }): T;
    getMapper<M>(clazz: {
        new (): M;
    }): IModelMapper<M>;
}
