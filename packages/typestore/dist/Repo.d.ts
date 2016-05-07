import Promise = require('bluebird');
import { IModelOptions, IKeyValue } from "./Types";
export declare abstract class Repo<M> {
    protected modelClazz: any;
    protected modelOpts: IModelOptions;
    constructor(modelClazz: {
        new (): M;
    });
    key(...args: any[]): IKeyValue;
    get(key: IKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: IKeyValue): Promise<any>;
    count(): Promise<number>;
}
