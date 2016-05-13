import * as AWS from 'aws-sdk'
import {IModelAttributeOptions,IModelOptions,ICoordinatorOptions} from 'typestore'

/**
 * Types of keys for dynamo
 */
export enum KeyType {
	HASH,
	RANGE
}

/**
 * Resource status exists/notExists
 */
export enum ResourceState {
	tableExists,
	tableNotExists
}

/**
 * Current table status for monitoring
 * creation and deletion
 */
export enum TableStatus {
	CREATING,
	UPDATING,
	DELETING,
	ACTIVE
}

export const StatusPending = [
	TableStatus.CREATING,
	TableStatus.UPDATING
]



/**
 * Finder types, in DynamoDB there are
 * two, Query & Scan
 */
export enum DynamoDBFinderType {
	Query,
	Scan
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
	awsAttrType?:string
}

/**
 * Table throughput provisioning
 */
export interface IDynamoDBProvisioning {
	writeCapacityUnits?:number
	readCapacityUnits?:number
}

/**
 * Additional model options for DynamoDB backed mode
 * 
 * provisioning & tableDef
 * 
 * tableDef is automatically populated - dont touch
 */
export interface IDynamoDBModelOptions extends IModelOptions {
	provisioning?:IDynamoDBProvisioning
	tableDef?:AWS.DynamoDB.CreateTableInput
}

export interface IDynamoDBStorePluginOptions {
	dynamoEndpoint?:string
	region?:string
	awsOptions?:AWS.ClientConfigPartial
	prefix?:string
}


export interface IDynamoDBFinderOptions {
	projection?:string // project expression - projectionExpression
	type?:DynamoDBFinderType // Query type
	index?:string //Name of the index to use
	queryExpression?:string // keyExpressionCondition - keyExpressionCondition
	scanExpression?:string // FilterExpression - FilterExpression
	array?: boolean,
	/**
	 * Map aliases in query to attributes
	 *
	 * @example
	 * {
	 *  '#yr': 'year'
	 * }
	 */
	aliases?: {[alias:string]:string} //expressionAttributeNames

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
	values?:(...args) => {[key:string]:any} | string[]
}
