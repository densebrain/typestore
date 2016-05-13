///<reference path="../typings/typestore-plugin-dynamodb"/>
import 'reflect-metadata'
import {
	Log,
	Types,
	Repo,
	Messages,
	ICoordinator,
	IStorePlugin,
	PluginType,
	IModel,
	IModelKey,
	IKeyValue,
	PluginEventType,
	SyncStrategy,
	ICoordinatorOptions,
	PromiseMap
} from 'typestore'

import * as AWS from 'aws-sdk'
import {DynamoDB} from 'aws-sdk'

import * as _ from 'lodash'
import * as assert from 'assert'

const {msg, Strings} = Messages

import {
	IDynamoDBModelOptions,
	IDynamoDBStorePluginOptions,
	IDynamoDBProvisioning,
	IDynamoDBAttributeOptions, TableStatus, KeyType, ResourceState, StatusPending
} from "./DynamoDBTypes"
import {DynamoDBRepoPlugin} from "./DynamoDBRepoPlugin"

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




function isTableStatusIn(status:string|TableStatus, ...statuses) {
	if (_.isString(status)) {
		status = TableStatus[status]
	}
	return _.includes(statuses, status)
}

function typeToDynamoType(type:any,typeName:string = null) {
	log.debug('type = ',type,typeName)
	return (type === String || typeName === 'String') ? 'S' : //string
		(type === Number || typeName === 'Number') ? 'N' :  //number
			(type === Array || typeName === 'Array') ? 'L' : // array
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



export class DynamoDBModelKey implements IModelKey {

	constructor(
		private hashKey:DynamoDBModelKeyAttribute,
		private rangeKey:DynamoDBModelKeyAttribute) {
	}
}

export class DynamoDBKeyValue implements IKeyValue {

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
export class DynamoDBStore implements IStorePlugin {

	type = PluginType.Store

	private _docClient:AWS.DynamoDB.DocumentClient
	private _dynamoClient:AWS.DynamoDB
	private _availableTables:string[] = []
	private tableDescs:{[TableName:string]:DynamoDB.TableDescription} = {}
	private repos:{[clazzName:string]:DynamoDBRepoPlugin<any>} = {}

	supportedModels:any[]
	coordinator:ICoordinator
	coordinatorOpts:ICoordinatorOptions

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
	constructor(private opts:IDynamoDBStorePluginOptions = {},...supportedModels:any[]) {
		this.supportedModels = supportedModels
		_.defaultsDeep(this.opts, DefaultDynamoDBOptions)
	}


	handle(eventType:PluginEventType, ...args):boolean|any {
		switch(eventType) {
			case PluginEventType.RepoInit:
				const repo:Repo<any> = args[0]
				if (this.supportedModels.length === 0 || this.supportedModels.includes(repo.modelClazz)) {
					return this.initRepo(repo)
				}
				
		}
		return false;
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

	/**
	 * Called during the coordinators initialization process
	 * 
	 * @param coordinator
	 * @param opts
	 * @returns {Promise<ICoordinator>}
	 */
	init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		this.coordinator = coordinator
		this.coordinatorOpts = opts

		return Promise.resolve(coordinator)
	}

	/**
	 * Create a new dynamo type store
	 *
	 * @returns {Promise<boolean>}
	 */
	async start():Promise<ICoordinator> {
		if (this.opts.awsOptions)
			AWS.config.update(this.opts.awsOptions)

		return await this.syncModels()
	}

	/**
	 * Stop/kill/shutdown the store
	 *
	 * @returns {Bluebird<boolean>}
	 */
	stop():Promise<ICoordinator> {
		this._docClient = null
		this._dynamoClient = null
		return Promise.resolve(this.coordinator)
	}


	initRepo<T extends Repo<M>, M extends IModel>(repo:T):T {
		const {clazzName} = repo.modelOpts
		if (this.repos[clazzName]) {
			return this.repos[clazzName].repo as T
		}

		this.repos[clazzName] =
			new DynamoDBRepoPlugin(this,repo)


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

		attr.awsAttrType = typeToDynamoType(type,attr.typeName)


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

		const model = this.coordinator.getModelByName(clazzName)
		const modelOptions = model.options as IDynamoDBModelOptions
		
		if (!modelOptions) {
			log.info('No model options found, returning null')
			return null
		}

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

			if (attr.primaryKey || attr.secondaryKey) {
				log.debug(`Adding key ${attr.name}`,awsAttr)
				// make sure its one or the other
				if (attr.primaryKey && attr.secondaryKey)
					assert(msg(Strings.ManagerOnlyOneKeyType, attr.name))

				keySchema.push({
					AttributeName: attr.name,
					KeyType: KeyType[
						(attr.primaryKey) ? KeyType.HASH : KeyType.RANGE
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
				if (indexDef.isSecondaryKey) {

				} else {
					const keySchema:DynamoDB.KeySchema = []
					keySchema.push({
						AttributeName: attr.name,
						KeyType: KeyType[KeyType.HASH]
					})

					attrDefs.push(allAttrs[attr.name])

					if (indexDef.secondaryKey) {
						keySchema.push({
							AttributeName: indexDef.secondaryKey,
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


		log.debug('Table def',JSON.stringify(modelOptions.tableDef,null,4))
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
	async waitForTable(TableName:string, resourceState:ResourceState = ResourceState.tableExists):Promise<boolean> {
		await this.dynamoClient.waitFor(
					ResourceState[resourceState],
					tableNameParam(TableName)
				).promise()

		return this.setTableAvailable(TableName)

	}

	/**
	 * Find an existing table
	 *
	 * @param TableName
	 * @return {any}
	 */
	async describeTable(TableName:string):Promise<DynamoDB.TableDescription> {

		try {
			let newTableDesc = await this.dynamoClient.describeTable({TableName}).promise()
			this.tableDescs[TableName] = newTableDesc.Table
			return newTableDesc.Table
		} catch (err) {
			if (err.code === 'ResourceNotFoundException') {
				log.info(`Table does not exist ${TableName}`)
				return null
			}

			throw err
		}
	}



	async createTable(tableDef:DynamoDB.CreateTableInput):Promise<boolean> {
		const TableName = tableDef.TableName
		log.info(`In create ${TableName}`,tableDef)

		let createResult = await this.dynamoClient.createTable(tableDef).promise()
		const status = createResult.TableDescription.TableStatus

		// ERROR STATE - table deleting
		if (isTableStatusIn(status, TableStatus.DELETING))
			throw new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName))

		if (isTableStatusIn(status, ...StatusPending)) {
			log.debug(`Waiting for table to create ${TableName}`)
			await this.waitForTable(TableName, ResourceState.tableExists)
		}

		this.setTableAvailable(tableDef.TableName)

		return true

	}

	async updateTable(tableDef:DynamoDB.CreateTableInput):Promise<any> {

		const TableName = tableDef.TableName
		const updateDef = _.clone(tableDef)
		delete updateDef.KeySchema

		const tableDesc = this.tableDescs[TableName]
		if (_.isMatch(tableDesc, updateDef)) {
			log.debug(`No change to table definition ${TableName}`)
			return Promise.resolve(this.setTableAvailable(TableName))
		}


		let updateResult = await this.dynamoClient.updateTable(updateDef as DynamoDB.UpdateTableInput).promise()
		const status = updateResult.TableDescription.TableStatus

		// ERROR STATE - table deleting
		if (isTableStatusIn(status, TableStatus.DELETING))
			throw new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName))

		if (isTableStatusIn(status, ...StatusPending)) {
			log.debug(`Waiting for table to update ${TableName}`)
			await this.waitForTable(TableName, ResourceState.tableExists)
		}

		return updateResult

	}

	async deleteTable(tableDef:DynamoDB.CreateTableInput):Promise<boolean> {
		const TableName = tableDef.TableName
		await this.dynamoClient.deleteTable({TableName}).promise()
		await this.waitForTable(TableName,ResourceState.tableNotExists)
		return true
	}

	/**
	 * Synchronize table with dynamo store
	 *
	 * @param tableDef
	 * @returns {any}
	 */
	async syncTable(tableDef:DynamoDB.CreateTableInput) {
		const TableName = tableDef.TableName


		log.info(`Creating table ${TableName}`)
		// If the table exists and in OVERWRITE MODE
		const tableInfo = await this.describeTable(TableName)
		if (tableInfo && this.coordinatorOpts.syncStrategy === Types.SyncStrategy.Overwrite) {
			await this.deleteTable(tableDef)
			return await this.createTable(tableDef)
		}

		// If the table does not exist
		if (!tableInfo) {
			return await this.createTable(tableDef)
		}

		if (isTableStatusIn(TableStatus[tableInfo.TableStatus], ...StatusPending)) {
			await this.waitForTable(TableName)
		} else {
			this.setTableAvailable(TableName)
		}

		await this.updateTable(tableDef)
		return true


	}

	async syncModels():Promise<ICoordinator> {

		try {
			log.info('Creating table definitions')

			// Get all table definitions no matter what

			const models = this.coordinator.getModels()

			const tableDefs = models.map(modelType => this.tableDefinition(modelType.name))

			// If create is not enabled then skip
			if (this.coordinatorOpts.syncStrategy !== SyncStrategy.None) {
				await PromiseMap(tableDefs, async (tableDef) => {
					await this.syncTable(tableDef)
				})
			}


			return this.coordinator
		} catch (err) {
			log.error(`table sync failed`,err.stack,err)
			throw err
		}


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

	async delete(params:DynamoDB.DeleteItemInput):Promise<DynamoDB.DeleteItemOutput> {
		return await this.documentClient.delete(params).promise()
		
	}


}


