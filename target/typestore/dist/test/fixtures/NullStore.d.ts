import { IStorePlugin, ICoordinatorOptions, ICoordinator, Repo, PluginType, IModel } from '../../index';
import { PluginEventType } from "../../PluginTypes";
export declare class NullStore implements IStorePlugin {
    type: PluginType;
    supportedModels: any[];
    private coordinator;
    constructor(...supportedModels: any[]);
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    syncModels(): Promise<ICoordinator>;
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
