import { IRepoPlugin, IKeyValue, IModel, Repo, ICoordinator, ICoordinatorOptions, PluginEventType, IFinderPlugin } from 'typestore';
import { IndexedDBPlugin } from "./IndexedDBPlugin";
import Dexie from "dexie";
/**
 * Super simple plain jain key for now
 * what you send to the constructor comes out the
 * other end
 *
 * just like poop!
 */
export declare class IndexedDBKeyValue implements IKeyValue {
    args: any[];
    constructor(...args: any[]);
}
export declare class IndexedDBRepoPlugin<M extends IModel> implements IRepoPlugin<M>, IFinderPlugin {
    private store;
    repo: Repo<M>;
    type: number;
    supportedModels: any[];
    private coordinator;
    private keys;
    constructor(store: IndexedDBPlugin, repo: Repo<M>);
    decorateFinder(repo: Repo<any>, finderKey: string): (...args: any[]) => Promise<M[]>;
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    readonly table: Dexie.Table<any, any>;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    key(...args: any[]): IndexedDBKeyValue;
    keyFromObject(o: any): IndexedDBKeyValue;
    get(key: IndexedDBKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: IndexedDBKeyValue): Promise<any>;
    count(): Promise<number>;
}
