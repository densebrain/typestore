import {
	TypeStoreFinderKey,
	TypeStoreRepoKey,
	TypeStoreFindersKey
} from "./Constants"
import {
	IModel,
	IFinderOptions,
	IndexAction,
	IRepoOptions,
	IIndexOptions,
	ISearchProvider,
	IPlugin,
	IModelMapper,
	ISearchOptions,
	IRepoPlugin,
	IFinderPlugin,
	IIndexerPlugin,
	ModelPersistenceEventType,
	PluginType
} from "./Types"
import {Coordinator} from './Coordinator'
import {NotImplemented} from "./Errors"
import * as Log from './log'

import {
	isFunction,
	isRepoPlugin,
	isFinderPlugin,
	PluginFilter,
	PromiseMap,
	isIndexerPlugin,
	isNumberOrString
} from "./Util"
import {ModelMapper} from "./ModelMapper"
import {IModelType} from "./ModelTypes"
import {IModelOptions, IModelKey, IKeyValue, TKeyValue} from "./decorations/ModelDecorations";
import {getMetadata} from "./MetadataManager";


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
	coordinator:Coordinator
	protected plugins = Array<IPlugin>()

	/**
	 * Core repo is instantiated by providing the implementing/extending
	 * class and the model that will be supported
	 *
	 * @param repoClazz
	 * @param modelClazz
	 */
	constructor(public repoClazz:any,public modelClazz:{new ():M;}) {
	}

	protected getRepoPlugins() {
		return PluginFilter<IRepoPlugin<M>>(this.plugins,PluginType.Repo)
		// return this.plugins
		// 	.filter((plugin) => isRepoPlugin(plugin)) as IRepoPlugin<M>[]
	}

	protected getFinderPlugins():IFinderPlugin[] {
		return PluginFilter<IFinderPlugin>(this.plugins,PluginType.Finder)
	}

	init(coordinator) {
		this.coordinator = coordinator
		this.modelType = coordinator.getModel(this.modelClazz)
		this.modelOpts = this.modelType.options
		this.repoOpts = Reflect.getMetadata(TypeStoreRepoKey,this.repoClazz) || {}

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

	getFinderOptions(finderKey:string):IFinderOptions {
		return getMetadata(
			TypeStoreFinderKey,
			this,
			finderKey
		) as IFinderOptions
	}

	decorateFinders() {
		const finderKeys = Reflect.getMetadata(TypeStoreFindersKey,this)
		if (finderKeys) {

			finderKeys.forEach((finderKey) => {
				let finder

				for (let plugin of this.plugins.filter(isFinderPlugin)) {
					if (!isFunction((plugin as any).decorateFinder))
						continue

					const finderPlugin = plugin as IFinderPlugin
					if (finder = finderPlugin.decorateFinder(this,finderKey))
						break
				}

				if (!finder && this.getFinderOptions(finderKey).optional !== true)
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
	 * @param searchProvider
	 * @param searchOpts
	 * @returns {any}
	 */
	makeGenericFinder(
		finderKey:string,
		searchProvider:ISearchProvider,
		searchOpts:ISearchOptions<any>
	) {

		/**
		 * Get the finder options
		 * @type {any}
		 */
		const opts:IFinderOptions = this.getFinderOptions(finderKey)

		return async (...args) => {
			let results = await searchProvider.search(
					this.modelType,
					searchOpts,
					args
				)


			// Once the provider returns the resulting data,
			// pass it to the mapper to get keys
			const keys:IModelKey[] = results.map((result:any) => {
				return searchOpts.resultKeyMapper(
					this,
					searchOpts.resultType,
					result
				)
			})

			return keys.map(async (key) => await this.get(key))

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
	 * Triggers manually attached persistence callbacks
	 * - works for internal indexing solutions, etc
	 *
	 * @param type
	 * @param models
	 */
	triggerPersistenceEvent(type:ModelPersistenceEventType,...models:any[]) {
		if (models.length < 1)
			return

		const {onPersistenceEvent} = this.modelType.options
		onPersistenceEvent && onPersistenceEvent(type,...models)
	}

	supportPersistenceEvents() {
		const {onPersistenceEvent} = this.modelType.options
		return typeof onPersistenceEvent !== 'undefined' && onPersistenceEvent !== null
	}

	/**
	 * Call out to the indexers
	 *
	 * @param type
	 * @param models
	 * @returns {Bluebird<boolean>}
	 */
	async index(type:IndexAction,...models:IModel[]):Promise<boolean> {
		const indexPlugins = PluginFilter<IIndexerPlugin>(this.plugins,PluginType.Indexer)

		const doIndex = (indexConfig:IIndexOptions):Promise<any>[] => {
			return indexPlugins.map(plugin => plugin.index(
				type,
				indexConfig,
				this.modelType,
				this,
				...models
			))
		}

		// Create all pending index promises
		if (this.repoOpts && this.repoOpts.indexes)
			await Promise.all(this.repoOpts.indexes.reduce((promises,indexConfig) => {
				return promises.concat(doIndex(indexConfig))
			},[]))

		return Promise.resolve(true)
	}

	indexPromise(action:IndexAction)  {
		return async (models:M[]) => {
			const indexPromise = this.index(action,...models.filter((model) => !!model))

			await Promise.resolve(indexPromise)
			return models
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
	async get(key:TKeyValue):Promise<M> {
		//const useKey = isNumberOrString(key) ? key |
		let results = this.getRepoPlugins().map(async (plugin) => await plugin.get(key))
		for (let result of results) {
			if (result)
				return result
		}

		return null
	}



	/**
	 * Save model
	 *
	 * @param o
	 * @returns {null}
	 */
	async save(o:M):Promise<M> {
		let results =  await PromiseMap(this.getRepoPlugins(), plugin => plugin.save(o))
		await this.indexPromise(IndexAction.Add)(results)
		for (let result of results) {
			if (result)
				return result
		}

		return null

	}


	/**
	 * Remove a model
	 *
	 * @param key
	 * @returns {null}
	 */
	async remove(key:TKeyValue):Promise<any> {
		let model = await this.get(key)
		if (!model) {
			log.warn(`No model found to remove with key`,key)
			return null
		}

		await PromiseMap(this.getRepoPlugins(), plugin => plugin.remove(key))
		return this.indexPromise(IndexAction.Remove)([model])

	}


	/**
	 * Count models
	 *
	 * @returns {null}
	 */
	async count():Promise<number> {
		let results = await Promise.all(this.getRepoPlugins().map(async (plugin) => await plugin.count()))
		return results.reduce((prev,current) => prev + current)

	}

	async bulkGet(...keys:TKeyValue[]):Promise<M[]> {
		let results =  await PromiseMap(
			this.getRepoPlugins(), plugin => plugin.bulkGet(...keys)
		)

		return results.reduce((allResults,result) => {
			return allResults.concat(result)
		},[])

	}

	async bulkSave(...models:M[]):Promise<M[]> {
		let results =  await PromiseMap(
			this.getRepoPlugins(), plugin => plugin.bulkSave(...models)
		)

		results = results.reduce((allResults,result) => {
			return allResults.concat(result)
		},[])

		await this.indexPromise(IndexAction.Add)(results)
		for (let result of results) {
			if (result)
				return result
		}

		const promises = models.map(model => this.save(model))
		return await Promise.all(promises)
	}

	async bulkRemove(...keys:TKeyValue[]):Promise<any[]> {
		const models = await this.bulkGet(...keys)
		if (models.length != keys.length)
			throw new Error('Not all keys exist')

		await PromiseMap(
			this.getRepoPlugins(), plugin => plugin.bulkRemove(...keys)
		)

		// results = results.reduce((allResults,result) => {
		// 	return allResults.concat(result)
		// },[])

		return this.indexPromise(IndexAction.Remove)(models)


	}
}

