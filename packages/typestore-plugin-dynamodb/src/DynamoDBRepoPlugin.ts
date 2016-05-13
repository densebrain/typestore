///<reference path="../typings/typestore-plugin-dynamodb"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-dynamodb"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-sdk"/>

import {
	Promise,
	Log,
	Types,
	Repo,
	ModelEvent,
	Messages,
	Errors,
	Constants,
	IModel,
	IPlugin,
	PluginType,
	IRepoPlugin,
	IFinderPlugin
} from 'typestore'
import * as assert from 'assert'
import * as _ from 'lodash'
import * as AWS from 'aws-sdk'
import {DynamoDB} from 'aws-sdk'
import {DynamoDBStore, DynamoDBFinderKey, DynamoDBModelKey, DynamoDBKeyValue} from "./DynamoDBStore";
import {IDynamoDBFinderOptions, DynamoDBFinderType} from "./DynamoDBTypes";



const {IncorrectKeyTypeError} = Errors;


const {TypeStoreFindersKey} = Constants

const log = Log.create(__filename)
const MappedFinderParams = {
	Projection: 'ProjectionExpression',
	QueryExpression: 'KeyConditionExpression',
	ScanExpression: 'FilterExpression',
	Aliases: 'ExpressionAttributeNames',
	Index: 'IndexName'

}

export class DynamoDBRepoPlugin<M extends IModel> implements IRepoPlugin<M> {

	
	private tableDef:DynamoDB.CreateTableInput
	private coordinator:Types.ICoordinator
	private mapper

	constructor(
		private store:DynamoDBStore,
		public repo:Repo<M>
	) {
		assert(repo,'Repo is required and must have a valid prototype')

		
		repo.attach(this)
		
		this.coordinator = this.store.coordinator

		// Grab the table definition
		this.tableDef = this.store.tableDefinition(repo.modelOpts.clazzName)

	}

	/**
	 * PluginType.Repo
	 */
	get type() {
		return PluginType.Repo
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
	 * Handle model events from the attached repository
	 * 
	 * @param event
	 * @param model
	 */
	handleModelEvent<M extends IModel>(event:ModelEvent,model:M):Promise<M> {
		switch(event) {
			default:
				return Promise.resolve(model)
		}
	}



	decorateFinder(repo:Repo<M>,finderKey:string) {
		const finderOpts:IDynamoDBFinderOptions = Reflect.getMetadata(DynamoDBFinderKey,this.repo,finderKey)
		if (!finderOpts) {
			log.debug(`${finderKey} is not a dynamo finder, no dynamo finder options`)
			return null
		}

		log.debug(`Making finder ${finderKey}:`,finderOpts)

		const type = finderOpts.type || DynamoDBFinderType.Query
		const defaultParams = this.makeParams()

		const valuesOpt = finderOpts.values
		const valueMapper = (args) => {
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

		Object.keys(finderOpts).forEach((key) => {
			let val = finderOpts[key]
			let awsKey = key.charAt(0).toUpperCase() + key.substring(1)
			let mappedKey = MappedFinderParams[awsKey]
			if (mappedKey) {
				defaultParams[mappedKey] = val
			}
		})

		// Create the finder function
		return (...args) => {

			//params.ExpressionsAttributeValues
			const params = _.assign(_.clone(defaultParams),{
				ExpressionAttributeValues: valueMapper(args)
			})

			// Find or scan
			return (((type === DynamoDBFinderType.Query) ?
				this.store.query(params as DynamoDB.QueryInput) :
				this.store.scan(params as DynamoDB.ScanInput)
			) as Promise<any>).then((results) => {
				return results.Items.map((item) => repo.mapper.fromObject(item))
			})
		}
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

	remove(key:DynamoDBKeyValue):Promise<any> {
		return this.store.delete(this.makeParams({
			Key: key.toParam()
		}))
	}

	count():Promise<number> {
		return this.store.describeTable(this.tableName)
			.then((tableDesc) => {
				return tableDesc.ItemCount
			})
	}
}
