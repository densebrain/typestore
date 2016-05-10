import { IKeyValue, Promise, IStore, Repo, IModel } from 'typestore';
export declare class MockRepo<M extends IModel> extends Repo<M> {
    private store;
    private repoClazz;
    private recordCount;
    constructor(store: IStore, repoClazz: any);
    key(...args: any[]): IKeyValue;
    get(key: IKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: IKeyValue): Promise<any>;
    count(): Promise<number>;
}
