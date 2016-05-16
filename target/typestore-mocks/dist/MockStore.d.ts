import { IStorePlugin, IKeyValue, ICoordinatorOptions, ICoordinator, Repo, IModel, PluginType, PluginEventType } from 'typestore';
import { IRepoPlugin } from "../../typestore/src/PluginTypes";
/**
 * Mock key value, gives whatever it gets
 */
export declare class MockKeyValue implements IKeyValue {
    args: any;
    constructor(...args: any[]);
}
/**
 * Mock store for testing, spying, etc
 */
export declare class MockStore implements IStorePlugin {
    supportedModels: any[];
    type: PluginType;
    coordinator: ICoordinator;
    repoPlugins: IRepoPlugin<any>[];
    constructor(...supportedModels: any[]);
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    syncModels(): Promise<ICoordinator>;
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
