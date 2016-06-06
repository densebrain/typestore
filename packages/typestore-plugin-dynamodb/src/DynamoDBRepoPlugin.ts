///<reference path="../typings/typestore-plugin-dynamodb"/>

import assert = require('assert')
import * as _ from 'lodash'
import {DynamoDB} from 'aws-sdk'

import {
	Log,Repo,PluginEventType,
	IModel,PluginType,IRepoPlugin,Coordinator,
	ICoordinatorOptions,getMetadata
} from 'typestore'

import {DynamoDBStorePlugin} from "./DynamoDBStorePlugin";
import {IDynamoDBFinderOptions, DynamoDBFinderType} from "./DynamoDBTypes";
import {DynamoDBFinderKey} from "./DynamoDBConstants";
import {DynamoDBKeyValue} from "./DynamoDBKeyValue";

const log = Log.create(__filename)
const MappedFinderParams = {
	Projection: 'ProjectionExpression',
	QueryExpression: 'KeyConditionExpression',
	ScanExpression: 'FilterExpression',
	Aliases: 'ExpressionAttributeNames',
	Index: 'IndexName'

}

export class DynamoDBRepoPlugin<M extends IModel> implements IRepoPlugin<M> {

	type = PluginType.Repo | PluginType.Finder
	supportedModels:any[]
	
	private tableDef:DynamoDB.CreateTableInput
	private coordinator:Coordinator

	constructor(private store:DynamoDBStorePlugin, public repo:Repo<M>) {
		assert(repo,'Repo is required and must have a valid prototype')
		
		repo.attach(this)
		
		this.coordinator = this.store.coordinator

		// Grab the table definition
		this.tableDef = this.store.tableDefinition(repo.modelOpts.clazzName)
		this.supportedModels = [repo.modelClazz]

	}


	handle(eventType:PluginEventType, ...args):boolean|any {
		return false;
	}

	async init(coordinator:Coordinator, opts:ICoordinatorOptions):Promise<Coordinator> {
		this.coordinator = coordinator
		return coordinator;
	}

	async start():Promise<Coordinator> {
		return this.coordinator;
	}

	async stop():Promise<Coordinator> {
		return this.coordinator;
	}

	/**
	 * Table name for this repo
	 * 
	 * @returns {TableName}
	 */
	get tableName() {
		return this.tableDef.TableName
	}

	/**
	 * DynamoDB API parameter helper
	 * 
	 * @param params
	 * @returns {({TableName: TableName}&{})|any}
	 */
	private makeParams(params = {}):any {
		return Object.assign({
			TableName: this.tableName
		},params)
	}


	/**
	 * Creates a value mapper, which maps
	 * arguments for a finder to values
	 * that can be used by dynamo
	 *
	 * @param valuesOpt
	 * @returns (any[]):{[key:string]:any}
	 */
	makeValueMapper(valuesOpt:Function | any[]) {
		return (args) => {
			if (valuesOpt) {
				return (_.isFunction(valuesOpt)) ?
					// If its a function then execute it
					valuesOpt(...args) :

					// If its an array map it by index
					(Array.isArray(valuesOpt)) ? (() => {
						const values = {}
						const argNameList = valuesOpt as any
						argNameList.forEach((valueOpt,index) => {
							values[`:${valueOpt}`] = args[index]
						})
					}) :

						// if its an object - good luck
						valuesOpt
			}

			return  {}
		}
	}


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
	makeFinderFn(repo,finderKey,finderOpts,defaultParams,valueMapper) {
		const type = finderOpts.type || DynamoDBFinderType.Query
		log.info(`Making finder fn ${finderKey}`)

		return async (...args) => {
			log.debug(`Executing finder ${finderKey}`)

			const params = _.assign(_.clone(defaultParams), {
				ExpressionAttributeValues: valueMapper(args)
			})

			// Find or scan
			let results = await (((type === DynamoDBFinderType.Query) ?
					this.store.query(params as DynamoDB.QueryInput) :
					this.store.scan(params as DynamoDB.ScanInput)
			) as Promise<any>)

			return results.Items.map((item) => repo.mapper.fromObject(item))
		}
	}

	/**
	 * Called by a repo to decorate a finder function
	 *
	 * @param repo
	 * @param finderKey
	 * @returns {any}
	 */
	decorateFinder(repo:Repo<M>,finderKey:string) {
		const finderOpts:IDynamoDBFinderOptions = getMetadata(DynamoDBFinderKey,this.repo,finderKey)
		if (!finderOpts) {
			log.debug(`${finderKey} is not a dynamo finder, no dynamo finder options`)
			return null
		}

		log.debug(`Making finder ${finderKey}:`,finderOpts)

		const defaultParams = this.makeParams()

		const valuesOpt = finderOpts.values
		const valueMapper = this.makeValueMapper(valuesOpt)

		Object.keys(finderOpts).forEach((key) => {
			let val = finderOpts[key]
			let awsKey = key.charAt(0).toUpperCase() + key.substring(1)
			let mappedKey = MappedFinderParams[awsKey]
			if (mappedKey) {
				defaultParams[mappedKey] = val
			}
		})

		// Create the finder function
		return this.makeFinderFn(repo,finderKey,finderOpts,defaultParams,valueMapper)


	}


	key(...args):DynamoDBKeyValue {
		assert(args && args.length > 0 && args.length < 3,
			'Either 1 or two parameters can be used to create dynamo keys')

		return new DynamoDBKeyValue(this.tableDef.KeySchema,args[0],args[1])
	}

	

	get(key:DynamoDBKeyValue):Promise<M> {
		return this.store.get(this.makeParams({
			Key: key.toParam()
		})).then((result) => {
			return this.repo.mapper.fromObject(result.Item)
		}) as Promise<M>


	}

	

	save(o:M):Promise<M> {
		return this.store.put(this.makeParams({Item:o as any}))
			.then((result:DynamoDB.PutItemOutput) => {
				return o
			})
	}
	
	

	async remove(key:DynamoDBKeyValue):Promise<any> {
		await this.store.delete(this.makeParams({
			Key: key.toParam()
		}))
	}

	async count():Promise<number> {
		const tableDesc = await this.store.describeTable(this.tableName)
		return tableDesc.ItemCount

	}


	async bulkGet(...keys:DynamoDBKeyValue[]):Promise<M[]> {
		const promises = keys.map(key => this.get(key))
		return await Promise.all(promises)
	}

	async bulkSave(...models:M[]):Promise<M[]> {
		const promises = models.map(model => this.save(model))
		return await Promise.all(promises)
	}

	async bulkRemove(...keys:DynamoDBKeyValue[]):Promise<any[]> {
		const promises = keys.map(key => this.remove(key))
		return await Promise.all(promises)
	}
}
