import 'reflect-metadata';
import { Repo, ICoordinator, IStorePlugin, PluginType, IModel, IModelKey, IKeyValue, PluginEventType, ICoordinatorOptions } from 'typestore';
import * as AWS from 'aws-sdk';
import { DynamoDB } from 'aws-sdk';
import { IDynamoDBStorePluginOptions, IDynamoDBProvisioning, IDynamoDBAttributeOptions, KeyType, ResourceState } from "./DynamoDBTypes";
export declare const DynamoDBFinderKey: string;
/**
 * Internal dynamo key map class
 */
export declare class DynamoDBModelKeyAttribute {
    private name;
    private attrType;
    private type;
    constructor(name: string, attrType: any, type: KeyType);
    toKeySchema(): {
        AttributeName: string;
        KeyType: KeyType;
    };
    toAttributeDef(): {
        AttributeName: string;
        AttributeType: string;
    };
}
export declare class DynamoDBModelKey implements IModelKey {
    private hashKey;
    private rangeKey;
    constructor(hashKey: DynamoDBModelKeyAttribute, rangeKey: DynamoDBModelKeyAttribute);
}
export declare class DynamoDBKeyValue implements IKeyValue {
    keySchema: DynamoDB.KeySchema;
    hashValue: any;
    rangeValue: any;
    constructor(keySchema: DynamoDB.KeySchema, hashValue: any, rangeValue: any);
    toParam(): any;
}
/**
 * Store implementation for DynamoDB
 */
export declare class DynamoDBStore implements IStorePlugin {
    private opts;
    type: PluginType;
    private _docClient;
    private _dynamoClient;
    private _availableTables;
    private tableDescs;
    private repos;
    supportedModels: any[];
    coordinator: ICoordinator;
    coordinatorOpts: ICoordinatorOptions;
    /**
     * Set default provisioning capacity
     *
     * @param provisioning
     */
    static setDefaultProvisioning(provisioning: IDynamoDBProvisioning): void;
    /**
     * Create new dynamodbstore
     */
    constructor(opts?: IDynamoDBStorePluginOptions, ...supportedModels: any[]);
    handle(eventType: PluginEventType, ...args: any[]): boolean | any;
    /**
     * Get all currently available tables
     *
     * @returns {string[]}
     */
    readonly availableTables: string[];
    /**
     * Get the AWS service options being used
     *
     * @returns {any}
     */
    readonly serviceOptions: any;
    /**
     * Retrieve the actual dynamo client
     *
     * @returns {AWS.DynamoDB}
     */
    readonly dynamoClient: DynamoDB;
    readonly documentClient: DynamoDB.DocumentClient;
    /**
     * Called during the coordinators initialization process
     *
     * @param coordinator
     * @param opts
     * @returns {Promise<ICoordinator>}
     */
    init(coordinator: ICoordinator, opts: ICoordinatorOptions): Promise<ICoordinator>;
    /**
     * Create a new dynamo type store
     *
     * @returns {Promise<boolean>}
     */
    start(): Promise<ICoordinator>;
    /**
     * Stop/kill/shutdown the store
     *
     * @returns {Bluebird<boolean>}
     */
    stop(): Promise<ICoordinator>;
    initRepo<T extends Repo<M>, M extends IModel>(repo: T): T;
    /**
     * Determine the attribute type to
     * be used with dynamo from the js def
     *
     * NOTE: If you manually set the awsAttrType
     * that value will be used
     *
     * @param attr
     * @returns {string}
     */
    attributeType(attr: IDynamoDBAttributeOptions): string;
    /**
     * Create dynamo table definition
     *
     * @param clazzName
     * @returns {AWS.DynamoDB.CreateTableInput}
     */
    tableDefinition(clazzName: string): AWS.DynamoDB.CreateTableInput;
    /**
     * Record the fact that the table is now available
     *
     * @param TableName
     * @returns {boolean}
     */
    setTableAvailable(TableName: string): boolean;
    /**
     * Wait for the table to become available
     *
     * @returns {Promise<boolean>}
     */
    waitForTable(TableName: string, resourceState?: ResourceState): Promise<boolean>;
    /**
     * Find an existing table
     *
     * @param TableName
     * @return {any}
     */
    describeTable(TableName: string): Promise<DynamoDB.TableDescription>;
    createTable(tableDef: DynamoDB.CreateTableInput): Promise<boolean>;
    updateTable(tableDef: DynamoDB.CreateTableInput): Promise<any>;
    deleteTable(tableDef: DynamoDB.CreateTableInput): Promise<boolean>;
    /**
     * Synchronize table with dynamo store
     *
     * @param tableDef
     * @returns {any}
     */
    syncTable(tableDef: DynamoDB.CreateTableInput): Promise<boolean>;
    syncModels(): Promise<ICoordinator>;
    /**
     * Query a table, likely from a finder
     *
     * @param params
     * @returns {Promise<DynamoDB.QueryOutput>}
     */
    query(params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput>;
    /**
     * Full table scan
     *
     * @param params
     * @returns {Promise<DynamoDB.ScanOutput>}
     */
    scan(params: DynamoDB.ScanInput): Promise<DynamoDB.ScanOutput>;
    /**
     * Get an item
     *
     * @param params
     * @returns {Promise<DynamoDB.GetItemOutput>}
     */
    get(params: DynamoDB.GetItemInput): Promise<DynamoDB.GetItemOutput>;
    /**
     * Create/Update item
     *
     * @param params
     * @returns {Promise<DynamoDB.PutItemOutput>}
     */
    put(params: DynamoDB.PutItemInput): Promise<DynamoDB.PutItemOutput>;
    delete(params: DynamoDB.DeleteItemInput): Promise<DynamoDB.DeleteItemOutput>;
}
