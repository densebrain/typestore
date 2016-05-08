import { Promise, Repo } from 'typestore';
import { DynamoDBStore, DynamoDBKeyValue } from "./DynamoDBStore";
export declare class DynamoDBRepo<M> extends Repo<M> {
    private store;
    private repoClazzName;
    private repoClazz;
    private repoType;
    private tableDef;
    private manager;
    private mapper;
    constructor(store: DynamoDBStore, repoClazzName: string, repoClazz: any);
    tableName: string;
    private makeParams(params?);
    private makeFinder(finderKey);
    key(...args: any[]): DynamoDBKeyValue;
    get(key: DynamoDBKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: DynamoDBKeyValue): Promise<any>;
    count(): Promise<number>;
}
