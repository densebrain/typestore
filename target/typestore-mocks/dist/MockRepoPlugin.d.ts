import { IKeyValue, IStorePlugin, ICoordinatorOptions, ICoordinator, Repo, IModel, IRepoPlugin, PluginType, PluginEventType } from 'typestore';
import { MockKeyValue } from "./MockStore";
export declare class MockRepoPlugin<M extends IModel> implements IRepoPlugin<M> {
    private store;
    private repo;
    type: PluginType;
    supportedModels: any[];
    private coordinator;
    private recordCount;
    constructor(store: IStorePlugin, repo: Repo<M>, ...supportedModels: any[]);
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    key(...args: any[]): MockKeyValue;
    get(key: IKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: IKeyValue): Promise<any>;
    count(): Promise<number>;
}
