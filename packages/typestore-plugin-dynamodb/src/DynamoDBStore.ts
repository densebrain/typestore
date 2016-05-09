///<reference path="../typings/typestore-plugin-dynamodb"/>
import TypeStore = require('typestore')
import {Promise,Log,Types,Repo,Messages} from 'typestore'

import * as AWS from 'aws-sdk'
import {DynamoDB} from 'aws-sdk'

import * as _ from 'lodash'
import * as assert from 'assert'

const {msg, Strings} = Messages

import {
	IDynamoDBModelOptions,
	IDynamoDBManagerOptions,
	IDynamoDBProvisioning,
	IDynamoDBAttributeOptions
} from "./DynamoDBTypes"
import {DynamoDBRepo} from "./DynamoDBRepo"

// Set the aws promise provide to bluebird
//(AWS.config as any).setPromiseDependency(Promise)

const log = Log.create(__filename)
const DynamoStrings = {
	TableDeleting: 'Table is DELETING ?0'
}



export const DynamoDBFinderKey = 'dynamodb:finder'


const DefaultDynamoDBProvisioning = {
	writeCapacityUnits: 5,
	readCapacityUnits: 5
}

const DefaultDynamoDBOptions = {
	awsOptions: {
		region: 'us-east-1'
	}
}

function tableNameParam(TableName:string) {
	return {TableName}
}

export enum KeyType {
	HASH,
	RANGE
}

export enum ResourceState {
	tableExists,
	tableNotExists
}

export enum TableStatus {
	CREATING,
	UPDATING,
	DELETING,
	ACTIVE
}

const StatusPending = [TableStatus.CREATING, TableStatus.UPDATING]

function isTableStatusIn(status:string|TableStatus, ...statuses) {
	if (_.isString(status)) {
		status = TableStatus[status]
	}
	return _.includes(statuses, status)
}

function typeToDynamoType(type:any) {
	return (type === String) ? 'S' : //string
		(type === Number) ? 'N' :  //number
			(type === Array) ? 'L' : // array
				'M' //object
}


/**
 * Internal dynamo key map class
 */
export class DynamoDBModelKeyAttribute {

	constructor(
		private name:string,
		private attrType:any,
		private type:KeyType) {
	}

	toKeySchema() {
		return {
			AttributeName:this.name,
			KeyType:this.type
		}
	}

	toAttributeDef() {
		return {
			AttributeName:this.name,
			AttributeType: typeToDynamoType(this.attrType)
		}
	}
}



export class DynamoDBModelKey implements Types.IModelKey {

	constructor(
		private hashKey:DynamoDBModelKeyAttribute,
		private rangeKey:DynamoDBModelKeyAttribute) {
	}
}

export class DynamoDBKeyValue implements Types.IKeyValue {

	constructor(
		public keySchema:DynamoDB.KeySchema,
		public hashValue:any,
	    public rangeValue:any
	) {}

	toParam() {
		const params:any = {}
		this.keySchema.forEach((keyDef) => {
			params[keyDef.AttributeName] =
				(KeyType[keyDef.KeyType] === KeyType.HASH) ?
					this.hashValue :
					this.rangeValue
		})

		return params
	}
}

/**
 * Store implementation for DynamoDB
 */
export class DynamoDBStore implements Types.IStore {
	private _docClient:AWS.DynamoDB.DocumentClient
	private _dynamoClient:AWS.DynamoDB
	private _availableTables:string[] = []
	private tableDescs:{[TableName:string]:DynamoDB.TableDescription} = {}
	private repos:{[clazzName:string]:DynamoDBRepo<any>} = {}

	private opts:IDynamoDBManagerOptions

	manager:Types.IManager

	/**
	 * Set default provisioning capacity
	 *
	 * @param provisioning
	 */
	static setDefaultProvisioning(provisioning:IDynamoDBProvisioning) {
		Object.assign(DefaultDynamoDBProvisioning, provisioning)
	}

	/**
	 * Create new dynamodbstore
	 */
	constructor() {
	}

	/**
	 * Get all currently available tables
	 *
	 * @returns {string[]}
	 */
	get availableTables() {
		return this._availableTables
	}

	/**
	 * Get the AWS service options being used
	 *
	 * @returns {any}
	 */
	get serviceOptions() {
		const opts:any = {}
		if (this.opts.dynamoEndpoint) {
			opts.endpoint = this.opts.dynamoEndpoint
		}

		return opts
	}

	/**
	 * Retrieve the actual dynamo client
	 *
	 * @returns {AWS.DynamoDB}
	 */
	get dynamoClient() {
		if (!this._dynamoClient) {
			this._dynamoClient = new AWS.DynamoDB(this.serviceOptions)
		}

		return this._dynamoClient
	}

	get documentClient() {
		if (!this._docClient) {
			this._docClient = new AWS.DynamoDB.DocumentClient(this.serviceOptions)
		}

		return this._docClient
	}

	init(manager:Types.IManager, opts:Types.IManagerOptions):Promise<boolean> {
		this.manager = manager
		this.opts = opts as IDynamoDBManagerOptions
		_.defaultsDeep(this.opts, DefaultDynamoDBOptions)

		return Promise.resolve(true)
	}

	/**
	 * Create a new dynamo type store
	 *
	 * @returns {Promise<boolean>}
	 */
	start():Promise<boolean> {


		if (this.opts.awsOptions)
			AWS.config.update(this.opts.awsOptions)


		return this.syncModels()
	}

	/**
	 * Stop/kill/shutdown the store
	 *
	 * @returns {Bluebird<boolean>}
	 */
	stop():Promise<boolean> {
		this._docClient = null
		this._dynamoClient = null
		return Promise.resolve(true)
	}



	/**
	 * Create a repo for the supplied
	 *
	 * @param clazz
	 * @returns {null}
	 */
	getRepo<T extends Repo<M>,M extends Types.IModel>(repoClazz:{new(): T; }):Repo<M> {
		//const repoClazzType = Reflect.getMetadata('design:type',repoClazz.prototype)
		const repoClazzName = (repoClazz as any).name

		// Check to see if we have created this repo before
		let repo = this.repos[repoClazzName]

		// If not - create it
		if (!repo) {
			repo = this.repos[repoClazzName] =
				new DynamoDBRepo<M>(this,repoClazzName,repoClazz)
		}

		return repo
	}


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
	attributeType(attr:IDynamoDBAttributeOptions):string {
		if (attr.awsAttrType) {
			return attr.awsAttrType
		}

		const type = attr.type
		log.info(`Checking attribute type for ${attr.name}`, type)

		attr.awsAttrType = typeToDynamoType(type)


		log.debug(`Resolved type ${attr.awsAttrType}`)

		return attr.awsAttrType
	}

	/**
	 * Create dynamo table definition
	 *
	 * @param clazzName
	 * @returns {AWS.DynamoDB.CreateTableInput}
	 */
	tableDefinition(clazzName:string):AWS.DynamoDB.CreateTableInput {
		log.debug(`Creating table definition for ${clazzName}`)

		const models = this.manager.getModels()
		const model = this.manager.getModelByName(clazzName)
		const modelOptions = model.options as IDynamoDBModelOptions

		const prefix = this.opts.prefix || '',
			TableName = `${prefix}${modelOptions.tableName}`


		// Create the table definition
		const provisioning = modelOptions.provisioning || {}
		_.defaults(provisioning, DefaultDynamoDBProvisioning)


		// Assemble attribute definitions
		const keySchema:DynamoDB.KeySchema = []
		const attrDefs:DynamoDB.AttributeDefinitions = []

		// Secondary instances
		const globalIndexes:DynamoDB.GlobalSecondaryIndex[] = []
		const allAttrs = {}
		modelOptions.attrs.forEach((attr:IDynamoDBAttributeOptions) => {

			// Determine attribute type
			attr.awsAttrType = this.attributeType(attr)

			// Create the attr
			const awsAttr = {
				AttributeName: attr.name,
				AttributeType: attr.awsAttrType
			}

			// Keep a ref for indexes
			allAttrs[attr.name] = awsAttr

			if (attr.hashKey || attr.rangeKey) {
				log.debug(`Adding key ${attr.name}`)
				// make sure its one or the other
				if (attr.hashKey && attr.rangeKey)
					assert(msg(Strings.ManagerOnlyOneKeyType, attr.name))

				keySchema.push({
					AttributeName: attr.name,
					KeyType: KeyType[
						(attr.hashKey) ? KeyType.HASH : KeyType.RANGE
					]
				})

				attrDefs.push(awsAttr)
			}
		})

		/**
		 * Loop again to build ancilaries - this could
		 * be baked in above, but separating leaves more
		 * options in the future
		 */
		modelOptions.attrs
			.forEach((attr:IDynamoDBAttributeOptions) => {
				if (!attr.index) return

				const indexDef = attr.index
				if (indexDef.isAlternateRangeKey) {

				} else {
					const keySchema:DynamoDB.KeySchema = []
					keySchema.push({
						AttributeName: attr.name,
						KeyType: KeyType[KeyType.HASH]
					})

					attrDefs.push(allAttrs[attr.name])

					if (indexDef.rangeKey) {
						keySchema.push({
							AttributeName: indexDef.rangeKey,
							KeyType: KeyType[KeyType.RANGE]
						})
					}

					globalIndexes.push({
						IndexName: indexDef.name,
						KeySchema: keySchema,
						Projection: {
							ProjectionType: 'ALL'
						},
						ProvisionedThroughput: {
							ReadCapacityUnits: provisioning.readCapacityUnits,
							WriteCapacityUnits: provisioning.writeCapacityUnits
						}
					})
				}
			})


		modelOptions.tableDef = {
			TableName,
			KeySchema: keySchema,
			AttributeDefinitions: attrDefs,
			GlobalSecondaryIndexes: globalIndexes,
			ProvisionedThroughput: {
				ReadCapacityUnits: provisioning.readCapacityUnits,
				WriteCapacityUnits: provisioning.writeCapacityUnits
			}
		}

		if (!globalIndexes.length) {
			delete modelOptions.tableDef['GlobalSecondaryIndexes']
		}

		return modelOptions.tableDef

	}





	/**
	 * Record the fact that the table is now available
	 *
	 * @param TableName
	 * @returns {boolean}
	 */
	setTableAvailable(TableName:string):boolean {
		log.info(`Setting table available ${TableName}`)
		this.availableTables.push(TableName)
		return true
	}

	/**
	 * Wait for the table to become available
	 *
	 * @returns {Promise<boolean>}
	 */
	waitForTable(TableName:string, resourceState:ResourceState = ResourceState.tableExists):Promise<boolean> {
		return Promise.resolve(
			this.dynamoClient.waitFor(
				ResourceState[resourceState],
				tableNameParam(TableName)
			)
			.promise()
		).then(this.setTableAvailable.bind(this,TableName)) as Promise<boolean>

	}

	/**
	 * Find an existing table
	 *
	 * @param TableName
	 * @return {any}
	 */
	describeTable(TableName:string):Promise<DynamoDB.TableDescription> {
		return Promise.resolve(
			this.dynamoClient.describeTable({TableName})
				.promise()
				.then((newTableDesc:DynamoDB.DescribeTableOutput) => {
					this.tableDescs[TableName] = newTableDesc.Table
					return newTableDesc.Table
				})
		).catch((err) => {
			if (err.code === 'ResourceNotFoundException') {
				log.info(`Table does not exist ${TableName}`)
				return Promise.resolve(null)
			}

			return Promise.reject(err)
		}) as Promise<DynamoDB.TableDescription>
	}


	createTable(tableDef:DynamoDB.CreateTableInput):Promise<boolean> {
		const TableName = tableDef.TableName
		log.info(`In create ${TableName}`)

		return Promise.resolve(
			this.dynamoClient.createTable(tableDef).promise()
			.then((createResult:DynamoDB.CreateTableOutput) => {
				const status = createResult.TableDescription.TableStatus

				// ERROR STATE - table deleting
				if (isTableStatusIn(status, TableStatus.DELETING))
					return Promise.reject(new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName)))

				const promised = Promise.resolve(createResult)
				if (isTableStatusIn(status, ...StatusPending)) {
					log.debug(`Waiting for table to create ${TableName}`)
					promised.then(() => {
						return this.waitForTable(TableName, ResourceState.tableExists)
					})
				}
				return promised.return(true)
			})
		)  as Promise<boolean>
	}

	updateTable(
		tableDef:DynamoDB.CreateTableInput
	):Promise<any> {

		const TableName = tableDef.TableName
		const updateDef = _.clone(tableDef)
		delete updateDef.KeySchema

		const tableDesc = this.tableDescs[TableName]
		if (_.isMatch(tableDesc, updateDef)) {
			log.debug(`No change to table definition ${TableName}`)
			return Promise.resolve(this.setTableAvailable(TableName))
		}

		return Promise.resolve(
			this.dynamoClient.updateTable(updateDef as DynamoDB.UpdateTableInput)
			.promise()
			.then((updateResult:DynamoDB.UpdateTableOutput) => {
				const status = updateResult.TableDescription.TableStatus

				// ERROR STATE - table deleting
				if (isTableStatusIn(status, TableStatus.DELETING))
					return Promise.reject(new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName)))

				const promised = Promise.resolve(updateResult)
				if (isTableStatusIn(status, ...StatusPending)) {
					log.debug(`Waiting for table to update ${TableName}`)
					promised
						.then(this.waitForTable.bind(this,TableName,ResourceState.tableExists))
						.return(updateResult)
				}


				return promised

			})
		)
	}

	deleteTable(tableDef:DynamoDB.CreateTableInput):Promise<boolean> {
		const TableName = tableDef.TableName
		return Promise.resolve(
			this.dynamoClient.deleteTable({TableName})
			.promise()
		).then(
			this.waitForTable.bind(
				this,
				TableName,
				ResourceState.tableNotExists
			)
		) as Promise<boolean>

	}

	/**
	 * Synchronize table with dynamo store
	 *
	 * @param tableDef
	 * @returns {any}
	 */
	syncTable(tableDef:DynamoDB.CreateTableInput) {
		const TableName = tableDef.TableName

		log.info(`Creating table ${TableName}`)
		return this.describeTable(TableName)
			.then((tableInfo:DynamoDB.TableDescription) => {

				// If the table exists and in OVERWRITE MODE
				if (tableInfo && this.opts.syncStrategy === Types.SyncStrategy.Overwrite) {
					return this.deleteTable(tableDef)
						.return(tableDef)
						.then(this.createTable.bind(this))
				}

				// If the table does not exist
				if (!tableInfo) {
					return this.createTable(tableDef)
				}

				if (isTableStatusIn(TableStatus[tableInfo.TableStatus], ...StatusPending))
					return this.waitForTable(TableName)
						.return(tableDef)
						.then(this.updateTable.bind(this))
				else
					return this.updateTable(tableDef)


			})

	}

	syncModels():Promise<boolean> {


		log.info('Creating table definitions')

		// Get all table definitions no matter what
		const tableDefs:DynamoDB.CreateTableInput[] = []
		const models = this.manager.getModels()

		for (let modelType of models) {
			tableDefs.push(this.tableDefinition(modelType.name))
		}

		// If create is not enabled then skip
		if (this.opts.syncStrategy === Types.SyncStrategy.None) {
			log.debug(msg(Strings.ManagerNoSyncModels))
			return Promise.resolve(true)
		}

		return Promise.each(tableDefs, this.syncTable.bind(this)).return(true)

	}

	/**
	 * Query a table, likely from a finder
	 *
	 * @param params
	 * @returns {Promise<DynamoDB.QueryOutput>}
	 */
	query(params:DynamoDB.QueryInput):Promise<DynamoDB.QueryOutput> {
		return Promise.resolve(
			this.documentClient.query(params).promise()
		) as Promise<DynamoDB.QueryOutput>
	}

	/**
	 * Full table scan
	 *
	 * @param params
	 * @returns {Promise<DynamoDB.ScanOutput>}
	 */
	scan(params:DynamoDB.ScanInput):Promise<DynamoDB.ScanOutput> {
		return Promise.resolve(
			this.documentClient.scan(params).promise()
		) as Promise<DynamoDB.ScanOutput>
	}

	/**
	 * Get an item
	 *
	 * @param params
	 * @returns {Promise<DynamoDB.GetItemOutput>}
	 */
	get(params:DynamoDB.GetItemInput):Promise<DynamoDB.GetItemOutput> {
		return Promise.resolve(
			this.documentClient.get(params).promise()
		) as Promise<DynamoDB.GetItemOutput>
	}


	/**
	 * Create/Update item
	 *
	 * @param params
	 * @returns {Promise<DynamoDB.PutItemOutput>}
	 */
	put(params:DynamoDB.PutItemInput):Promise<DynamoDB.PutItemOutput> {
		return Promise.resolve(
			this.documentClient.put(params).promise()
		) as Promise<DynamoDB.PutItemOutput>
	}

	delete(params:DynamoDB.DeleteItemInput):Promise<DynamoDB.DeleteItemOutput> {
		return Promise.resolve(
			this.documentClient.delete(params).promise()
		) as Promise<DynamoDB.DeleteItemOutput>
	}


}


