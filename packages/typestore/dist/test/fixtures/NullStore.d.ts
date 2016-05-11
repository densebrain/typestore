import { Promise, IStore, IManagerOptions, IManager, Repo, PluginType, IModel } from '../../index';
export declare class NullStore implements IStore {
    constructor();
    type: PluginType;
    init(manager: IManager, opts: IManagerOptions): Promise<boolean>;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    syncModels(): Promise<boolean>;
    prepareRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
}
