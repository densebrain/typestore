import Dexie from 'dexie';
import { ICoordinator, ICoordinatorOptions, Repo, IModel, PluginType, IStorePlugin, IModelType, PluginEventType } from 'typestore';
/**
 * Options interface
 */
export interface IIndexedDBOptions {
    /**
     * Database name for Dexie/indexdb
     */
    databaseName?: string;
    provider?: {
        indexedDB: any;
        IDBKeyRange: any;
    };
}
/**
 * Default options
 */
export declare const LocalStorageOptionDefaults: {
    databaseName: string;
};
/**
 * Uses dexie under the covers - its a mature library - and i'm lazy
 */
export declare class IndexedDBPlugin implements IStorePlugin {
    private opts;
    type: PluginType;
    supportedModels: any[];
    private coordinator;
    private internalDb;
    private repoPlugins;
    private tables;
    constructor(opts?: IIndexedDBOptions, ...supportedModels: any[]);
    private open();
    readonly db: Dexie;
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    table(modelType: IModelType): Dexie.Table<any, any>;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    syncModels(): Promise<ICoordinator>;
    /**
     * Initialize a new repo
     * TODO: verify this logic works - just reading it makes me think we could be
     *  asked to init a repo a second time with the same type and do nothing
     *
     * @param repo
     * @returns {T}
     */
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
