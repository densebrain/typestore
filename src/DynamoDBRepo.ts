import Promise = require('./Promise')

import * as assert from 'assert'
import * as Log from './log'
import * as _ from 'lodash'
import * as AWS from 'aws-sdk'
import {DynamoDB} from 'aws-sdk'
import {Repo} from "./Repo";
import {DynamoDBStore, DynamoDBFinderKey, DynamoDBModelKey, DynamoDBKeyValue} from "./DynamoDBStore";
import {DynoFindersKey} from "./Constants";
import {IDynamoDBFinderOptions, DynamoDBFinderType} from "./DynamoDBTypes";
import {IModelKey, IKeyValue} from "./Types";
import {IncorrectKeyTypeError} from "./Errors";

const log = Log.create(__filename)
const MappedFinderParams = {
	Projection: 'ProjectionExpression',
	QueryExpression: 'KeyConditionExpression',
	ScanExpression: 'FilterExpression',
	Aliases: 'ExpressionAttributeNames',
	Index: 'IndexName'

}

export class DynamoDBRepo<M> extends Repo<M> {

	private repoType:any
	private tableDef:DynamoDB.CreateTableInput
	private mapper

	constructor(
		private store:DynamoDBStore,
		private repoClazzName:string,
		private repoClazz:any
	) {
		super(new repoClazz().modelClazz)
		assert(repoClazz && repoClazz.prototype,'Repo class is required and must have a valid prototype')

		const repoType = this.repoType = repoClazz.prototype
		const repoTypeKeys = Reflect.getOwnMetadataKeys(repoType)
		log.debug(`Repo type (${this.repoClazzName} keys: ${repoTypeKeys.join(', ')}`)

		// Grab the table definition
		this.tableDef = this.store.tableDefinition((this.modelClazz as any).name)

		// Grab a mapper
		this.mapper = this.store.manager.getMapper(this.modelClazz)

		const finderKeys = Reflect.getMetadata(DynoFindersKey,repoType)
		if (finderKeys) {
			finderKeys.forEach((finderKey) => this.makeFinder(finderKey))
		}

		log.info(`Building repo`)


	}

	get tableName() {
		return this.tableDef.TableName
	}

	private makeParams(params = {}):any {
		return Object.assign({
			TableName: this.tableName
		},params)
	}


	private makeFinder(finderKey) {
		const finderOpts:IDynamoDBFinderOptions = Reflect.getMetadata(DynamoDBFinderKey,this.repoType,finderKey)
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
		this[finderKey] = (...args) => {

			//params.ExpressionsAttributeValues
			const params = _.assign(_.clone(defaultParams),{
				ExpressionAttributeValues: valueMapper(args)
			})

			// Find or scan
			return (((type === DynamoDBFinderType.Query) ?
				this.store.query(params as DynamoDB.QueryInput) :
				this.store.scan(params as DynamoDB.ScanInput)
			) as Promise<any>).then((results) => {
					const models = [] as M[]
					results.Items.forEach((item) => models.push(this.mapper.fromObject(item)))

					return models
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
			return this.mapper.fromObject(result.Item)
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
