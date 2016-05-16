import { Repo, PluginEventType, IModel, IRepoPlugin, Coordinator, ICoordinatorOptions } from 'typestore';
import { DynamoDBStorePlugin } from "./DynamoDBStorePlugin";
import { DynamoDBKeyValue } from "./DynamoDBKeyValue";
export declare class DynamoDBRepoPlugin<M extends IModel> implements IRepoPlugin<M> {
    private store;
    repo: Repo<M>;
    type: number;
    supportedModels: any[];
    private tableDef;
    private coordinator;
    constructor(store: DynamoDBStorePlugin, repo: Repo<M>);
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    init(coordinator: Coordinator, opts: ICoordinatorOptions): Promise<Coordinator>;
    start(): Promise<Coordinator>;
    stop(): Promise<Coordinator>;
    /**
     * Table name for this repo
     *
     * @returns {TableName}
     */
    readonly tableName: string;
    /**
     * DynamoDB API parameter helper
     *
     * @param params
     * @returns {({TableName: TableName}&{})|any}
     */
    private makeParams(params?);
    /**
     * Creates a value mapper, which maps
     * arguments for a finder to values
     * that can be used by dynamo
     *
     * @param valuesOpt
     * @returns (any[]):{[key:string]:any}
     */
    makeValueMapper(valuesOpt: Function | any[]): (args: any) => any;
    /**
     * Create the actual finder function
     * that is used by the repo
     *
     * @param repo
     * @param finderKey
     * @param finderOpts
     * @param defaultParams
     * @param valueMapper
     * @returns {function(...[any]): Promise<any>}
     */
    makeFinderFn(repo: any, finderKey: any, finderOpts: any, defaultParams: any, valueMapper: any): (...args: any[]) => Promise<any>;
    /**
     * Called by a repo to decorate a finder function
     *
     * @param repo
     * @param finderKey
     * @returns {any}
     */
    decorateFinder(repo: Repo<M>, finderKey: string): (...args: any[]) => Promise<any>;
    key(...args: any[]): DynamoDBKeyValue;
    get(key: DynamoDBKeyValue): Promise<M>;
    save(o: M): Promise<M>;
    remove(key: DynamoDBKeyValue): Promise<any>;
    count(): Promise<number>;
}
