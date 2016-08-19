import * as _ from 'lodash'

import {
	IIndexerPlugin,
	IndexAction,
	IIndexOptions,
	ISearchProvider,
	IModelType,
	IModel,
	PluginType,
	ISearchOptions,
	Repo,
	Log,
	ICoordinator,
	ICoordinatorOptions,
	PluginEventType,
	IFinderPlugin,
	repoAttachIfSupported
} from 'typestore'

import {CloudSearchDomain} from 'aws-sdk'
import {ICloudSearchOptions} from "./CloudSearchTypes";
import {CloudSearchDefaults, CloudSearchFinderKey} from "./CloudSearchConstants";

import getMetadata = Reflect.getMetadata;


const log = Log.create(__filename)
const clients:{[endpoint:string]:CloudSearchDomain} = {}

/**
 * Retrieve an AWS CloudSearch client
 *
 * @param endpoint
 * @param awsOptions
 * @returns {CloudSearchDomain}
 */
function getClient(endpoint:string,awsOptions:any = {}) {
	let client = clients[endpoint]
	if (!client) {
		Object.assign(awsOptions,{endpoint})
		clients[endpoint] = client = new CloudSearchDomain(awsOptions)
	}

	return client
}

/**
 * Create a cloud search provider plugin
 */
export class CloudSearchProviderPlugin implements IIndexerPlugin, IFinderPlugin, ISearchProvider {

	type = PluginType.Indexer | PluginType.Finder

	supportedModels:any[]
	private client:CloudSearchDomain
	private endpoint:string
	private awsOptions:any
	private typeField:string
	private coordinator


	/**
	 * Create a new AWS CloudSearch Provider
	 *
	 * @param options
	 * @param supportedModels
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
				repoAttachIfSupported(args[0] as Repo<any>, this)
				break

		}
		return false
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
	async index<M extends IModel>(type:IndexAction, options:IIndexOptions, modelType:IModelType, repo:Repo<M>, ...models:IModel[]):Promise<boolean> {

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


	/**
	 * Create a cloud search finder if decorated
	 *
	 * @param repo
	 * @param finderKey
	 * @returns {function(...[any]): Promise<Promise<any>[]>}
	 */
	decorateFinder(repo:Repo<any>, finderKey:string) {
		const searchOpts = getMetadata(CloudSearchFinderKey,repo,finderKey)

		return (searchOpts) ?
			repo.makeGenericFinder(finderKey,this,searchOpts) :
			null
	}


	initRepo<T extends Repo<M>, M extends IModel>(repo:T):T {
		return repo.attach(this)
	}
}
