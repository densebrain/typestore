import { Promise, IStorePlugin, IKeyValue, ICoordinatorOptions, ICoordinator, Repo, IModel, PluginType } from 'typestore';
export declare class MockKeyValue implements IKeyValue {
    args: any;
    constructor(...args: any[]);
}
export declare class MockStore implements IStorePlugin {
    coordinator: ICoordinator;
    constructor();
    type: PluginType;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    syncModels(): Promise<ICoordinator>;
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
