import * as Log from './log'
import * as AWS from 'aws-sdk'
import {DynamoDB} from 'aws-sdk'
import * as _ from 'lodash'
import * as assert from 'assert'
import Promise from './Promise'
import {IManagerOptions, IAttributeOptions, IModelOptions, IStore, IManager} from "./Types";
import {msg, Strings} from "./Messages"

//const DynamoDB = AWS.DynamoDB

const log = Log.create(__filename)
const DynamoStrings = {
	TableDeleting: 'Table is DELETING ?0'
}

export interface IDynamoDBAttributeOptions extends IAttributeOptions {
	awsAttrType?:string
}

export interface IDynamoDBProvisioning {
	writeCapacityUnits?:number
	readCapacityUnits?:number
}

export interface IDynamoDBModelOptions extends IModelOptions {
	provisioning?:IDynamoDBProvisioning
}

export interface IDynamoDBManagerOptions extends IManagerOptions {
	dynamoEndpoint?: string
	region?:string
	awsOptions?:AWS.ClientConfigPartial
	prefix?:string
}

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

enum KeyTypes {
	HASH,
	RANGE
}

enum ResourceState {
	tableExists,
	tableNotExists
}

enum TableStatus {
	CREATING,
	UPDATING,
	DELETING,
	ACTIVE
}

const StatusPending = [TableStatus.CREATING,TableStatus.UPDATING]

function isTableStatusIn(status:string|TableStatus,...statuses) {
	if (_.isString(status)) {
		status = TableStatus[status]
	}
	return _.includes(statuses,status)
}


export class DynamoDBStore implements IStore {
	private _docClient:AWS.DynamoDB.DocumentClient
	private _dynamoClient:AWS.DynamoDB
	private _availableTables:string[] = []
	private opts:IDynamoDBManagerOptions
	private manager:IManager

	/**
	 * Set default provisioning capacity
	 *
	 * @param provisioning
	 */
	static setDefaultProvisioning(provisioning:IDynamoDBProvisioning) {
		Object.assign(DefaultDynamoDBProvisioning,provisioning)
	}

	/**
	 *
	 * @param baseOpts
	 */
	constructor() {
	}

	get availableTables() {
		return this._availableTables
	}

	get serviceOptions() {
		const opts:any = {}
		if (this.opts.dynamoEndpoint) {
			opts.endpoint = this.opts.dynamoEndpoint
		}

		return opts
	}

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

	init(manager:IManager,opts:IManagerOptions):Promise<boolean> {
		this.manager = manager
		this.opts = opts as IDynamoDBManagerOptions
		_.defaultsDeep(this.opts,DefaultDynamoDBOptions)

		return Promise.resolve(true)
	}

	/**
	 * Create a new dynamo type store
	 *
	 * @param manager
	 * @param opts
	 * @returns {Bluebird<boolean>}
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

		attr.awsAttrType =
			(type === String) ? 'S' : //string
				(type === Number) ? 'N' :  //number
					(type === Array) ? 'L' : // array
						'M' //object

		log.debug(`Resolved type ${attr.awsAttrType}`)

		return attr.awsAttrType
	}

	tableDefinition(clazzName:string):AWS.DynamoDB.CreateTableInput {
		log.debug(`Creating table definition for ${clazzName}`)

		const modelRegs = this.manager.getModelRegistrations()
		const modelReg = modelRegs[clazzName] as IDynamoDBModelOptions

		const prefix = this.opts.prefix || '',
			TableName = `${prefix}${modelReg.tableName}`

		// Assemble attribute definitions
		const keySchema:DynamoDB.KeySchema = []
		const attrDefs:DynamoDB.AttributeDefinitions = []
		modelReg.attrs.forEach((attr:IDynamoDBAttributeOptions) => {

			// Determine attribute type
			attr.awsAttrType = this.attributeType(attr)

			if (attr.partitionKey || attr.sortKey) {
				log.debug(`Adding key ${attr.name}`)
				// make sure its one or the other
				if (attr.partitionKey && attr.sortKey)
					assert(msg(Strings.ManagerOnlyOneKeyType,attr.name))

				keySchema.push({
					AttributeName: attr.name,
					KeyType: KeyTypes[
						(attr.partitionKey) ?KeyTypes.HASH : KeyTypes.RANGE
					]
				})

				attrDefs.push({
					AttributeName: attr.name,
					AttributeType: attr.awsAttrType
				})
			}


		})

		// Create the table definition
		const provisioning = modelReg.provisioning || {}
		_.defaults(provisioning,DefaultDynamoDBProvisioning)

		modelReg.tableDef = {
			TableName,
			KeySchema: keySchema,
			AttributeDefinitions: attrDefs,
			ProvisionedThroughput: {
				ReadCapacityUnits: provisioning.readCapacityUnits,
				WriteCapacityUnits: provisioning.writeCapacityUnits
			}
		}

		return modelReg.tableDef

	}



	syncTable(tableDef:DynamoDB.CreateTableInput) {
		const TableName = tableDef.TableName
		let tableDesc:DynamoDB.DescribeTableOutput = null

		const setTableAvailable = () => {
			log.info(`Setting table available ${TableName}`)
			this.availableTables.push(TableName)
			return true
		}


		/**
		 * Wait for the table to become available
		 *
		 * @returns {Promise<boolean>}
		 */
		const waitForTable = () => {
			return this.dynamoClient.waitFor(
				ResourceState[ResourceState.tableExists],
				tableNameParam(TableName)
			).promise().then(setTableAvailable)
		}

		/**
		 * Find an existing table
		 */
		const findExistingTable = () => {
			return this.dynamoClient.describeTable({TableName})
				.promise()
				.then((newTableDesc:DynamoDB.DescribeTableOutput) => {
					return tableDesc = newTableDesc
				})
				.catch((err) => {
					if (err.code === 'ResourceNotFoundException') {
						log.info(`Table does not exist ${TableName}`)
						return Promise.resolve(null)
					}

					return Promise.reject(err)
				})
		}

		/**
		 * Create a new table
		 *
		 * @returns {Promise<any>}
		 */
		const createTable = ():Promise<any> => {

			return this.dynamoClient.createTable(tableDef).promise()
				.then((createResult:DynamoDB.CreateTableOutput) => {
					// TODO: AFTER LUNCH - HERE
					// * check result scheme in dash
					// * implement waitFor table complete
					// * progress/time updates in future
					// * TableStatus in the result data is what
					// * i want - CREATING/UPDATING
					const status = createResult.TableDescription.TableStatus

					// ERROR STATE - table deleting
					if (isTableStatusIn(status,TableStatus.DELETING))
						return Promise.reject(new Error(msg(DynamoStrings.TableDeleting,tableDef.TableName)))

					const promised = Promise.resolve(createResult)
					if (isTableStatusIn(status,...StatusPending)) {
						log.debug(`Waiting for table to create ${TableName}`)
						promised.then(waitForTable).return(createResult)
					}


					return promised
			})  as Promise<any>

		}

		const updateTable = () => {
			const updateDef = _.clone(tableDef)
			delete updateDef.KeySchema

			//debugger
			if (_.isMatch(tableDesc.Table,updateDef)) {
				log.debug(`No change to table definition ${TableName}`)
				return Promise.resolve(setTableAvailable())
			}

			return this.dynamoClient.updateTable(updateDef as DynamoDB.UpdateTableInput)
				.promise()
				.then((updateResult:DynamoDB.UpdateTableOutput) => {
					const status = updateResult.TableDescription.TableStatus

					// ERROR STATE - table deleting
					if (isTableStatusIn(status,TableStatus.DELETING))
						return Promise.reject(new Error(msg(DynamoStrings.TableDeleting,tableDef.TableName)))

					const promised = Promise.resolve(updateResult)
					if (isTableStatusIn(status,...StatusPending)) {
						log.debug(`Waiting for table to update ${TableName}`)
						promised.then(waitForTable).return(updateResult)
					}


					return promised

				})
		}

		log.info(`Creating table ${TableName}`)
		return findExistingTable()
			.then((tableInfo:DynamoDB.TableDescription) => {
				if (!tableInfo) {
					return createTable()
				}

				if (isTableStatusIn(TableStatus[tableInfo.TableStatus],...StatusPending))
					return waitForTable().then(updateTable)
				else
					return updateTable()


			})

	}

	syncModels():Promise<boolean> {


		log.info('Creating table definitions')

		// Get all table definitions no matter what
		const tableDefs:DynamoDB.CreateTableInput[] = []
		const modelRegistrations = this.manager.getModelRegistrations()

		for (let clazzName of Object.keys(modelRegistrations)) {
			tableDefs.push(this.tableDefinition(clazzName))
		}

		// If create is not enabled then skip
		if (this.opts.syncModels !== true) {
			log.debug(msg(Strings.ManagerNoCreateTables))
			return Promise.resolve(true)
		}

		return Promise.each(tableDefs,this.syncTable.bind(this)).return(true)

	}
}
