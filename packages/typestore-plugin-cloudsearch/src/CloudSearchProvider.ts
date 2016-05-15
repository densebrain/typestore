///<reference path="../typings/typestore-plugin-cloudsearch"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-cloudsearchdomain"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-config.d.ts"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-sdk"/>
import * as _ from 'lodash'

import {
	IIndexerPlugin,
	IndexAction,
	IIndexerOptions,
	ISearchProvider,
	IModelType,
	IModel,
	PluginType,
	ISearchOptions,
	Repo,
	Log,
	ICoordinator,
	ICoordinatorOptions,
	PluginEventType
} from 'typestore'

import {CloudSearchDomain} from 'aws-sdk'
import {ICloudSearchOptions} from "./CloudSearchTypes";
import {CloudSearchDefaults} from "./CloudSearchConstants";


const log = Log.create(__filename)
const clients:{[endpoint:string]:CloudSearchDomain} = {}

function getClient(endpoint:string,awsOptions:any = {}) {
	let client = clients[endpoint]
	if (!client) {
		Object.assign(awsOptions,{endpoint})
		clients[endpoint] = client = new CloudSearchDomain(awsOptions)
	}

	return client
}


export class CloudSearchProvider implements IIndexerPlugin, ISearchProvider {

	type = PluginType.Indexer

	private client:CloudSearchDomain
	private endpoint:string
	private awsOptions:any
	private typeField:string
	private coordinator
	private supportedModels:any[]

	/**
	 * Create a new AWS CloudSearch Provider
	 *
	 * @param options
	 */
	constructor(private options:ICloudSearchOptions,...supportedModels:any[]) {
		this.supportedModels = supportedModels
		_.defaultsDeep(options,CloudSearchDefaults)
		
		Object.assign(this,options)
		
		this.client = getClient(this.endpoint,this.awsOptions)
	}


	handle(eventType:PluginEventType, ...args):boolean|any {
		switch(eventType) {
			case PluginEventType.RepoInit:
				const repo:Repo<any> = args[0]
				if (this.supportedModels.length === 0 || this.supportedModels.includes(repo.modelClazz)) {
					repo.attach(this)
					return repo
				}

		}
		return false;
	}

	async init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		return (this.coordinator = coordinator);
	}

	/**
	 * Called to start the plugin
	 * 
	 * @returns {any}
	 */
	async start():Promise<ICoordinator> {
		return this.coordinator;
	}

	/**
	 * Called to stop the plugin
	 * 
	 * @returns {any}
	 */
	async stop():Promise<ICoordinator> {
		return this.coordinator;
	}

	/**
	 * Indexing action pushing documents to CloudSearch
	 * 
	 * @param type
	 * @param options
	 * @param modelType
	 * @param repo
	 * @param models
	 * @returns {boolean}
	 */
	async index<M extends IModel>(type:IndexAction,options:IIndexerOptions,modelType:IModelType,repo:Repo<M>,...models:IModel[]):Promise<boolean> {

		// Destructure all the import fields into 'docs'
		const docs = models.map((model) => {
			return options.fields.reduce((doc,field) => {
				doc[field] = model[field]
				return doc
			},{
				[this.typeField]: modelType.name
			})
		})

		// Now convert to cloudsearch data
		const data = docs.map((doc) => {
			return Object.assign({
				id:doc[options.fields[0]]
			},{
				fields:doc
			},{
				type:(IndexAction.Remove === type) ? 'delete' : 'add'
			})
		})

		// Create request params
		const params = {contentType: 'application/json',documents:JSON.stringify(data)}
		await this.client.uploadDocuments(params).promise()
		return true

	}

	/**
	 * This needs to implemented a bit cleaner ;)
	 *
	 * Currently all args are just joined
	 * with spaces and jammed into the query field
	 *
	 * @param modelType
	 * @param opts
	 * @param args
	 * @returns {any}
	 */
	async search<R extends any>(modelType:IModelType, opts:ISearchOptions<R>, ...args):Promise<R[]> {
		const params = {
			query: `(and ${this.typeField}:'${modelType.name}' (term '${encodeURIComponent(args.join(' '))}'))`,
			queryParser: 'structured'
		}

		log.info('Querying with params', params)

		let results = await this.client.search(params).promise()
		return results.hits.hit
	}
}