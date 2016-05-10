import { Promise, Types, Repo } from 'typestore';
import * as AWS from 'aws-sdk';
import { DynamoDB } from 'aws-sdk';
import { IDynamoDBProvisioning, IDynamoDBAttributeOptions } from "./DynamoDBTypes";
export declare const DynamoDBFinderKey: string;
export declare enum KeyType {
    HASH = 0,
    RANGE = 1,
}
export declare enum ResourceState {
    tableExists = 0,
    tableNotExists = 1,
}
export declare enum TableStatus {
    CREATING = 0,
    UPDATING = 1,
    DELETING = 2,
    ACTIVE = 3,
}
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
export declare class DynamoDBModelKey implements Types.IModelKey {
    private hashKey;
    private rangeKey;
    constructor(hashKey: DynamoDBModelKeyAttribute, rangeKey: DynamoDBModelKeyAttribute);
}
export declare class DynamoDBKeyValue implements Types.IKeyValue {
    keySchema: DynamoDB.KeySchema;
    hashValue: any;
    rangeValue: any;
    constructor(keySchema: DynamoDB.KeySchema, hashValue: any, rangeValue: any);
    toParam(): any;
}
/**
 * Store implementation for DynamoDB
 */
export declare class DynamoDBStore implements Types.IStore {
    private _docClient;
    private _dynamoClient;
    private _availableTables;
    private tableDescs;
    private repos;
    private opts;
    manager: Types.IManager;
    /**
     * Set default provisioning capacity
     *
     * @param provisioning
     */
    static setDefaultProvisioning(provisioning: IDynamoDBProvisioning): void;
    /**
     * Create new dynamodbstore
     */
    constructor();
    /**
     * Get all currently available tables
     *
     * @returns {string[]}
     */
    availableTables: string[];
    /**
     * Get the AWS service options being used
     *
     * @returns {any}
     */
    serviceOptions: any;
    /**
     * Retrieve the actual dynamo client
     *
     * @returns {AWS.DynamoDB}
     */
    dynamoClient: DynamoDB;
    documentClient: DynamoDB.DocumentClient;
    init(manager: Types.IManager, opts: Types.IManagerOptions): Promise<boolean>;
    /**
     * Create a new dynamo type store
     *
     * @returns {Promise<boolean>}
     */
    start(): Promise<boolean>;
    /**
     * Stop/kill/shutdown the store
     *
     * @returns {Bluebird<boolean>}
     */
    stop(): Promise<boolean>;
    /**
     * Create a repo for the supplied
     *
     * @param clazz
     * @returns {null}
     */
    getRepo<T extends Repo<M>, M extends Types.IModel>(repoClazz: {
        new (): T;
    }): Repo<M>;
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
    syncTable(tableDef: DynamoDB.CreateTableInput): any;
    syncModels(): Promise<boolean>;
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
