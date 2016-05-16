import * as AWS from 'aws-sdk';
import { IModelAttributeOptions, IModelOptions } from 'typestore';
/**
 * Types of keys for dynamo
 */
export declare enum KeyType {
    HASH = 0,
    RANGE = 1,
}
/**
 * Resource status exists/notExists
 */
export declare enum ResourceState {
    tableExists = 0,
    tableNotExists = 1,
}
/**
 * Current table status for monitoring
 * creation and deletion
 */
export declare enum TableStatus {
    CREATING = 0,
    UPDATING = 1,
    DELETING = 2,
    ACTIVE = 3,
}
export declare const StatusPending: TableStatus[];
/**
 * Finder types, in DynamoDB there are
 * two, Query & Scan
 */
export declare enum DynamoDBFinderType {
    Query = 0,
    Scan = 1,
}
/**
 * AWS attr type options
 */
export interface IDynamoDBAttributeOptions extends IModelAttributeOptions {
    /**
     * Amazon DynamoDB type
     * directly maps to value class
     * using this table
     *
     * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
     */
    awsAttrType?: string;
}
/**
 * Table throughput provisioning
 */
export interface IDynamoDBProvisioning {
    writeCapacityUnits?: number;
    readCapacityUnits?: number;
}
/**
 * Additional model options for DynamoDB backed mode
 *
 * provisioning & tableDef
 *
 * tableDef is automatically populated - dont touch
 */
export interface IDynamoDBModelOptions extends IModelOptions {
    provisioning?: IDynamoDBProvisioning;
    tableDef?: AWS.DynamoDB.CreateTableInput;
}
export interface IDynamoDBStorePluginOptions {
    endpoint?: string;
    region?: string;
    awsOptions?: AWS.ClientConfigPartial;
    prefix?: string;
}
export interface IDynamoDBFinderOptions {
    projection?: string;
    type?: DynamoDBFinderType;
    index?: string;
    queryExpression?: string;
    scanExpression?: string;
    array?: boolean;
    /**
     * Map aliases in query to attributes
     *
     * @example
     * {
     *  '#yr': 'year'
     * }
     */
    aliases?: {
        [alias: string]: string;
    };
    /**
     * Function - mapper that takes all method
     * args and returns placeholder to value mapping
     *
     * Array - args index -> name
     *
     * @example
     * // With function
     * function(...args) {
     *  return { randomText: args[0] }
     * }
     *
     * // Identical to string array
     * ['randomText']
     *
     */
    values?: (...args) => {
        [key: string]: any;
    } | string[];
}
