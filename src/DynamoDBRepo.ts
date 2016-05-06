import Promise = require('bluebird')

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
	Aliases: 'ExpressionAttributeNames'

}

export class DynamoDBRepo<M> extends Repo<M> {

	private repoType:any

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

		const finderKeys = Reflect.getMetadata(DynoFindersKey,repoType)
		if (finderKeys) {
			finderKeys.forEach((finderKey) => this.makeFinder(finderKey))
		}

		log.info(`Building repo`)
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
		const valueMapper = (...args) => {
			if (valuesOpt) {
				return (_.isFunction(valuesOpt)) ?
					// If its a function then execute it
					valuesOpt(args) :

					// If its an array map it by index
					(_.isArray(valuesOpt)) ? () => {
						const values:any = {}
						_.forEach(valuesOpt as Array,(valueOpt,index) => {
							values[valueOpt] = args[index]
						})
					} :

					// if its an object - good luck
					valuesOpt
			}

			return  {}
		}

		Object.keys(finderOpts).forEach((key) => {
			let val = finderOpts[key]
			let awsKey = _.capitalize(key)
			let mappedKey = MappedFinderParams[awsKey]
			if (mappedKey) {
				defaultParams[mappedKey] = val
			}


		})


		this[finderKey] = (...args) => {

			//params.ExpressionsAttributeValues
			const params = _.assign(_.clone(defaultParams),{
				ExpressionsAttributeValues: valueMapper(args)
			})

			// Find or scan
			let results = (type === DynamoDBFinderType.Query) ?
				this.store.query(params as DynamoDB.QueryInput) :
				this.store.scan(params as DynamoDB.ScanInput)


		}
	}


	key(...args):DynamoDBKeyValue {
		assert(args && args.length > 0 && args.length < 3,
			'Either 1 or two parameters can be used to create dynamo keys')

		const tableDef = this.store.tableDefinition(this.modelClazz.name)
		return new DynamoDBKeyValue(tableDef.KeySchema,args[0],args[1])
	}

	get(key:IKeyValue):Promise<M> {
		if(key instanceof DynamoDBKeyValue)
			this.store.get(this.makeParams({
				Key: key.toParam()
			})).then((result) => {
				//TODO: Assign item data to model
				return this.newModel()
			})

		throw new IncorrectKeyTypeError(`Expected ${DynamoDBKeyValue.name}`)
	}

	save(o:M):Promise<M> {
		return this.store.put(this.makeParams({Item:o as any}))
			.then((result:DynamoDB.PutItemOutput) => {
				//TODO: IMplement item data to model
				return o
			})
	}

	remove(key:DynamoDBModelKey):Promise<M> {
		return null
	}
}
