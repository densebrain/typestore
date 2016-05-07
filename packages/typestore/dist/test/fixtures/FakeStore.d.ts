import Promise = require('../../Promise');
import { IStore, IManager, IManagerOptions } from '../../Types';
import { Repo } from "../../Repo";
export declare class FakeStore implements IStore {
    constructor();
    init(manager: IManager, opts: IManagerOptions): Promise<boolean>;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    syncModels(): Promise<boolean>;
    getRepo<T extends Repo<M>, M extends any>(clazz: {
        new (): T;
    }): T;
}
