import { Promise, IStorePlugin, ICoordinatorOptions, ICoordinator, Repo, PluginType, IModel } from '../../index';
export declare class NullStore implements IStorePlugin {
    private coordinator;
    constructor();
    type: PluginType;
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    start(): Promise<ICoordinator>;
    stop(): Promise<ICoordinator>;
    syncModels(): Promise<ICoordinator>;
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
