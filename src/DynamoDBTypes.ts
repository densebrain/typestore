import * as AWS from 'aws-sdk'
//import {DynamoDB} from 'aws-sdk'

import {IManagerOptions, IModelOptions, IModelAttributeOptions} from "./Types";
export enum DynamoDBFinderType {
	Query,
	Scan
}


export interface IDynamoDBAttributeOptions extends IModelAttributeOptions {
	awsAttrType?:string
}

export interface IDynamoDBProvisioning {
	writeCapacityUnits?:number
	readCapacityUnits?:number
}

export interface IDynamoDBModelOptions extends IModelOptions {
	provisioning?:IDynamoDBProvisioning
	tableDef?:AWS.DynamoDB.CreateTableInput
}

export interface IDynamoDBManagerOptions extends IManagerOptions {
	dynamoEndpoint?:string
	region?:string
	awsOptions?:AWS.ClientConfigPartial
	prefix?:string
}


export interface IDynamoDBFinderOptions {
	projection?:string // project expression - projectionExpression
	type?:DynamoDBFinderType // Query type
	indexName?:string //Name of the index to use
	queryExpression?:string // keyExpressionCondition - keyExpressionCondition
	scanExpression?:string // FilterExpression - FilterExpression

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
