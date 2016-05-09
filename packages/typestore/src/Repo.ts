import Promise = require('./Promise')

import {
	IModelKey,
	IModelOptions,
	IKeyValue,
	IModel,
	IFinderOptions,
	IStore,
	IndexType,
	IRepoOptions,
	IIndexerOptions
} from "./Types";
import {NotImplemented} from "./Errors";
import {TypeStoreModelKey, TypeStoreFinderKey, TypeStoreRepoKey} from "./Constants";
import * as Log from './log'

const log = Log.create(__filename)

export abstract class Repo<M extends IModel> {

	protected modelClazz
	protected modelOpts:IModelOptions
	protected repoOpts:IRepoOptions
	
	constructor(modelClazz:{new ():M;}) {
		this.modelClazz = modelClazz
		this.modelOpts = Reflect.getMetadata(TypeStoreModelKey,modelClazz.prototype)
		this.repoOpts = Reflect.getMetadata(TypeStoreRepoKey,this.constructor)
	}

	protected makeFinder(finderKey:string) {
		const opts:IFinderOptions = Reflect.getMetadata(
			TypeStoreFinderKey,
			this.modelClazz,
			finderKey
		)

		const searchOpts = opts.searchOptions
		
		if (!searchOpts) {
			log.debug('Generic finders are only created with a specified SearchProvider')
			return
		}
		
		this.setFinder(finderKey,(...args) => {
			return searchOpts.provider.search(
				this.modelClazz,
				searchOpts,
				args
			).then((results) => {
				
				// Once the provider returns the resulting data,
				// pass it to the mapper to get keys
				const keys:IModelKey[] = results.map((result:any) => {
					return searchOpts.resultKeyMapper(
						this,
						searchOpts.resultType,
						result
					)
				})

				
				return Promise.map(keys,(key) => {
					return this.get(key)
				})
			})
		})

	}

	/**
	 * Set a finder function on the repo
	 * 
	 * @param finderKey
	 * @param finderFn
	 */
	protected setFinder(finderKey:string,finderFn:(...args) => any) {
		this[finderKey] = finderFn
	}

	/**
	 * Call out to the indexers
	 *
	 * @param type
	 * @param models
	 * @returns {Bluebird<boolean>}
	 */
	index(type:IndexType,...models:IModel[]):Promise<boolean> {
		return Promise.map(this.repoOpts.indexers || [], (indexerConfig:IIndexerOptions) => {
			return indexerConfig.indexer
				.index(
					type,
					indexerConfig,
					this.modelClazz,
					this,
					...models
				)
		}).return(true)
	}
	
	/**
	 * Not implemented
	 *
	 * @param args
	 * @returns {null}
	 */
	key(...args):IKeyValue {
		return NotImplemented('key')
	}

	/**
	 * Get one or more models with keys
	 *
	 * @param key
	 * @returns {null}
	 */
	get(key:IKeyValue):Promise<M> {
		return NotImplemented('get')
	}

	/**
	 * Save model
	 *
	 * @param o
	 * @returns {null}
	 */
	save(o:M):Promise<M> {
		return NotImplemented('save')
	}


	/**
	 * Remove a model
	 *
	 * @param key
	 * @returns {null}
	 */
	remove(key:IKeyValue):Promise<any> {
		return NotImplemented('remove')
	}

	/**
	 * Count models
	 *
	 * @returns {null}
	 */
	count():Promise<number> {
		return NotImplemented('count')
	}
}
