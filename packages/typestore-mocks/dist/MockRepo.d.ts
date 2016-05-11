import { IKeyValue, Promise, IStorePlugin, Repo, IModel, IRepoPlugin, PluginType } from 'typestore';
import { MockKeyValue } from "./MockStore";
export declare class MockRepoPlugin<M extends IModel> implements IRepoPlugin<M> {
    private store;
    private repo;
    private recordCount;
    constructor(store: IStorePlugin, repo: Repo<M>);
    type: PluginType;
    key(...args: any[]): MockKeyValue;
    get(key: IKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: IKeyValue): Promise<any>;
    count(): Promise<number>;
}
