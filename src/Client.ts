import * as Log from './log'
import * as AWS from 'aws-sdk'
import * as _ from 'lodash'
import * as assert from 'assert'
import {IManagerOptions} from "./Types";

const log = Log.create(__filename)

export class Client {
	private _docClient:AWS.DynamoDB.DocumentClient
	private _dynamoClient:AWS.DynamoDB

	constructor(private opts:IManagerOptions) {
		log.debug('New dynamo client')

		if (opts.awsOptions)
			AWS.config.update(opts.awsOptions)
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
}
