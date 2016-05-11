import Promise = require('./Promise')
import {TypeStoreModelKey, TypeStoreFinderKey, TypeStoreRepoKey, TypeStoreFindersKey} from "./Constants"
import {
	IModelKey,
	IModelOptions,
	IKeyValue,
	IModel,
	IFinderOptions,
	IStorePlugin,
	IndexAction,
	IRepoOptions,
	IIndexerOptions,
	IPlugin,
	IModelMapper,
	ICoordinator
} from "./Types"
import {Coordinator} from './Coordinator'
import {NotImplemented} from "./Errors"
import * as Log from './log'
import {IRepoPlugin, IFinderPlugin, PluginType} from "./PluginTypes"
import {isFunction, isRepoPlugin, isFinderPlugin, PluginFilter} from "./Util"
import {ModelMapper} from "./ModelMapper"
import {IModelType} from "./ModelTypes"

const log = Log.create(__filename)

/**
 * The core Repo implementation
 * 
 * When requested from the coordinator,
 * it offers itself to all configured plugins for 
 * them to attach to the model pipeline
 * 
 * 
 */
export class Repo<M extends IModel> {

	modelOpts:IModelOptions
	repoOpts:IRepoOptions
	modelType:IModelType
	mapper
	protected plugins = Array<IPlugin>()

	/**
	 * Core repo is instantiated by providing the implementing/extending
	 * class and the model that will be supported
	 *
	 * @param repoClazz
	 * @param modelClazz
	 */
	constructor(public repoClazz:any,public modelClazz:{new ():M;}) {
		this.modelType = Coordinator.getModel(modelClazz)
		this.modelOpts = this.modelType.options
		this.repoOpts = Reflect.getMetadata(TypeStoreRepoKey,repoClazz)




	}

	start() {
		// Grab a mapper
		this.mapper = this.getMapper(this.modelClazz)

		// Decorate all the finders
		this.decorateFinders()
	}


	getMapper<M extends IModel>(clazz:{new():M;}):IModelMapper<M> {
		return new ModelMapper(clazz)
	}

	protected getRepoPlugins() {
		return PluginFilter<IRepoPlugin<M>>(this.plugins,PluginType.Repo)
		// return this.plugins
		// 	.filter((plugin) => isRepoPlugin(plugin)) as IRepoPlugin<M>[]
	}

	protected getFinderPlugins():IFinderPlugin[] {
		return PluginFilter<IFinderPlugin>(this.plugins,PluginType.Finder)
	}

	/**
	 * Attach a plugin to the repo - could be a store,
	 * indexer, etc, etc
	 * 
	 * @param plugin
	 * @returns {Repo}
	 */
	attach(plugin:IPlugin):this {
		if (this.plugins.includes(plugin)) {
			log.warn(`Trying to register repo plugin a second time`)
		} else {
			this.plugins.push(plugin)
		}
		
		return this
	}
	
	decorateFinders() {
		const finderKeys = Reflect.getMetadata(TypeStoreFindersKey,this)
		if (finderKeys) {

			finderKeys.forEach((finderKey) => {
				let finder = null

				for (let plugin of this.plugins) {
					if (!isFunction((plugin as any).decorateFinder))
						continue

					const finderPlugin = plugin as IFinderPlugin
					if (finder = finderPlugin.decorateFinder(this,finderKey))
						break
				}

				if (!finder)
					finder = this.genericFinder(finderKey)

				if (!finder)
					NotImplemented(`No plugin supports this finder ${finderKey}`)

				this.setFinder(finderKey,finder)
			})
		}
	}

	/**
	 * Create a generic finder, in order
	 * to do this search options must have been
	 * annotated on the model
	 *
	 * @param finderKey
	 * @returns {any}
	 */
	protected genericFinder(finderKey:string) {
		const opts:IFinderOptions = Reflect.getMetadata(
			TypeStoreFinderKey,
			this,
			finderKey
		)

		const searchOpts = opts.searchOptions
		
		if (!searchOpts) {
			log.debug('Generic finders are only created with a specified SearchProvider')
			return null
		}


		return (...args) => {
			return searchOpts.provider.search(
				this.modelType,
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
		}

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
	index(type:IndexAction,...models:IModel[]):Promise<boolean> {
		return Promise.map(this.repoOpts.indexers || [], (indexerConfig:IIndexerOptions) => {
			return indexerConfig.indexer
				.index(
					type,
					indexerConfig,
					this.modelType,
					this,
					...models
				)
		}).return(true)
	}

	indexPromise(action:IndexAction)  {
		return (models:IModel[]) => {
			return this
				.index(
					action,
					...models.filter((model) => !!model)
				)
				.return(models)
		}
	}

	/**
	 * Not implemented
	 *
	 * @param args
	 * @returns {null}
	 */
	key(...args):IKeyValue {
		for (let plugin of this.getRepoPlugins()) {
			const key = plugin.key(...args)
			if (key)
				return key
		}

		return NotImplemented('key')
	}

	/**
	 * Get one or more models with keys
	 *
	 * @param key
	 * @returns {null}
	 */
	get(key:IKeyValue):Promise<M> {
		return Promise
			.map(this.getRepoPlugins(),(plugin:IRepoPlugin<M>) => plugin.get(key))
			.then((results:M[]) => {
				for (let result of results) {
					if (result)
						return result
				}

				return null
			})
	}



	/**
	 * Save model
	 *
	 * @param o
	 * @returns {null}
	 */
	save(o:M):Promise<M> {
		return Promise
			.map(this.getRepoPlugins(),(plugin:IRepoPlugin<M>) => plugin.save(o))

			// After they're saved successfully we
			// pass them off for indexing
			.then(this.indexPromise(IndexAction.Add))
			.then((results:M[]) => {
				for (let result of results) {
					if (result)
						return result
				}

				return null
			})
	}


	/**
	 * Remove a model
	 *
	 * @param key
	 * @returns {null}
	 */
	remove(key:IKeyValue):Promise<any> {
		return this
			.get(key)
			.then((model) => {
				if (!model) {
					log.warn(`No model found to remove with key`,key)
					return null
				}

				return Promise
					.map(this.getRepoPlugins(),(plugin:IRepoPlugin<M>) => plugin.remove(key))

					// After they're removed successfully we
					// pass them off for indexing
					.return([model])
					.then(this.indexPromise(IndexAction.Remove))
			})



	}

	
	/**
	 * Count models
	 *
	 * @returns {null}
	 */
	count():Promise<number> {
		return Promise
			.map(this.getRepoPlugins(),(plugin:IRepoPlugin<M>) => plugin.count())
			.then((results:number[]) => {
				return results.reduce((prev,current) => prev + current)
			})
	}
}
