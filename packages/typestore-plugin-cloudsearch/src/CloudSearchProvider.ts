///<reference path="../typings/typestore-plugin-cloudsearch"/>


import {
	Promise,
	IIndexer,
	IndexType,
	IIndexerOptions,
	ISearchProvider,
	IModelType,
	IModel,
	IStore,
	ISearchOptions,
	Repo
} from 'typestore'

import {CloudSearchDomain} from 'aws-sdk'

const clients:{[endpoint:string]:CloudSearchDomain} = {}

function getClient(endpoint:string) {
	let client = clients[endpoint]
	if (!client) {
		clients[endpoint] = client = new CloudSearchDomain({endpoint})
	}

	return client
}


export class CloudSearchProvider implements IIndexer, ISearchProvider {

	private client:CloudSearchDomain

	constructor(private endpoint:string) {
		this.client = getClient(endpoint)
	}

	index<M extends IModel>(type:IndexType,options:IIndexerOptions,modelType:IModelType,repo:Repo<M>,...models:IModel[]):Promise<boolean> {

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
				type:(IndexType.Remove === type) ? 'remove' : 'add'
			})
		})

		const params = {contentType: 'application/json',documents:JSON.stringify(data)}
		return this.client.uploadDocuments(params)
			.promise()
			.return(true)
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
		return this.client.search({query: args.join(' ')})
			.promise()
			.then((results) => {
				return results.hits.hit
			})
	}
}