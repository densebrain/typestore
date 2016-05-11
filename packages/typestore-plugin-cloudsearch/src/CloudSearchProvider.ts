///<reference path="../typings/typestore-plugin-cloudsearch"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-cloudsearchdomain"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-config.d.ts"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-sdk"/>


import {
	Promise,
	IIndexerPlugin,
	IndexAction,
	IIndexerOptions,
	ISearchProvider,
	IModelType,
	IModel,
	IStorePlugin,
	PluginType,
	ISearchOptions,
	Repo
} from 'typestore'

import {CloudSearchDomain} from 'aws-sdk'

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

	private client:CloudSearchDomain

	constructor(private endpoint:string,private awsOptions:any = {}) {
		this.client = getClient(endpoint,awsOptions)
	}
	
	get type() {
		return PluginType.Indexer
	}

	index<M extends IModel>(type:IndexAction,options:IIndexerOptions,modelType:IModelType,repo:Repo<M>,...models:IModel[]):Promise<boolean> {

		const docs = models.map((model) => {
			const doc = {}
			options.fields.forEach((field) => doc[field] = model[field])
			return doc
		})

		const data = docs.map((doc) => {
			return Object.assign({
				id:doc[options.fields[0]]
			},{
				fields:doc
			},{
				type:(IndexAction.Remove === type) ? 'delete' : 'add'
			})
		})

		const params = {contentType: 'application/json',documents:JSON.stringify(data)}
		return Promise.resolve(
			this.client.uploadDocuments(params)
				.promise()
		).return(true)
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
	search<R extends any>(modelType:IModelType, opts:ISearchOptions<R>, ...args):Promise<R[]> {
		return Promise.resolve(
			this.client.search({query: args.join(' ')})
				.promise()
				.then((results) => {
					return results.hits.hit
				})
		) as Promise<R[]>
	}
}