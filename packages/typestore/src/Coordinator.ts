import 'reflect-metadata'
import './Globals'
import Promise = require('./Promise')
import assert = require('assert')

import * as Log from './log'
import {TypeStoreModelKey,TypeStoreAttrKey} from './Constants'
import {
	IModelOptions, IModelAttributeOptions, IStorePlugin, ICoordinatorOptions, IModelMapper, IModel, IModelType,
	CoordinatorOptions, ICoordinator, IPlugin, PluginType
} from './Types'
import {msg, Strings} from "./Messages"
import {Repo} from "./Repo";
import {ModelMapper} from "./ModelMapper";
import {PluginFilter} from "./Util";

// Create logger
const log = Log.create(__filename)

export namespace Coordinator {

	const plugins:IPlugin[] = []

	/**
	 * Model registration map type
	 */
	export type TModelTypeMap = {[clazzName:string]:IModelType}


	/**
	 * Stores all registrations, enabling
	 * them to be configured against a
	 * changed client, multiple datasources,
	 * utility scripts, etc
	 *
	 * @type {{}}
	 */
	
	const modelMap:TModelTypeMap = {}
	const models:IModelType[] = [] 
	
	
	/**
	 * Retrieve model registrations
	 *
	 * @returns {TModelTypeMap}
	 */
	export function getModels():IModelType[] {
		return models
	}

	function findModel(predicate) {
		for (let modelType of models) {
			if (predicate(modelType)) {
				return modelType
			}
		}

		log.info('unable to find registered model for clazz in',Object.keys(modelMap))
		return null
	}
	
	export function getModel(clazz:any):IModelType {
		return findModel((model) => model.clazz === clazz)
	}
	
	export function getModelByName(name:string):IModelType {
		return findModel((model) => model.name === name)
	}

	/**
	 * Default options
	 */
	let options:ICoordinatorOptions = new CoordinatorOptions(null)

	export function getOptions() {
		return options
	}
	
	
	let initialized = false

	// NOTE: settled and settling promise are overriden properties - check below namespace
	let started = false
	let startPromise:Promise<any> = null


	function checkInitialized(not:boolean = false) {
		checkStarted(true)
		assert(not ? !initialized : initialized,
			msg(not ? Strings.ManagerInitialized : Strings.ManagerNotInitialized))
	}



	function checkStarted(not:boolean = false) {
		const valid = (not) ? !started : started

		assert(valid, msg(not ? Strings.ManagerSettled : Strings.ManagerNotSettled))
	}

	export function stores() {
		return PluginFilter<IStorePlugin>(plugins,PluginType.Store)
	}
	
	

	/**
	 * Set the coordinator options
	 */
	export function init(newOptions:ICoordinatorOptions, ...newPlugins:IPlugin[]):Promise<ICoordinator> {
		checkStarted(true)
		checkInitialized(true)
		initialized = true
		plugins.push(...newPlugins)

		// Update the default options
		options = options || newOptions
		Object.assign(options,newOptions)


		// Make sure we got a valid store
		assert(stores().length > 0,msg(Strings.ManagerTypeStoreRequired))

		// Coordinator is ready, now initialize the store
		log.debug(msg(Strings.ManagerInitComplete))
		return Promise
			.map(stores(),(store:IStorePlugin) => store.init(this,options))
			.return(this) as Promise<ICoordinator>
	}


	/**
	 * Start the coordinator and embedded store from options
	 *
	 * @returns {Bluebird<boolean>}
	 */
	export function start(...models):Promise<ICoordinator> {
		checkStarted(true)
		models.forEach(registerModel)

		return startPromise = Promise
			.map(stores(), (store:IStorePlugin) => store.start())
			.return(this)
			.catch((err) => {
				log.error(msg(Strings.ManagerFailedToStart),err)
				startPromise = null
			})
	}

	/**
	 * Execute function either immediately if
	 * ready or when the starting promise
	 * completes
	 *
	 * @param fn
	 */
	function execute<T>(fn:Function):Promise<T> {
		return new Promise<T>((resolve,reject) => {

			function executeFn(...args) {
				const result = fn(...args)
				resolve(result)
			}

			function handleError(err) {
				const fnName = (fn) ? (fn as any).name : null
				log.error(msg(Strings.ManagerErrorFn,fnName ? fnName : 'UNKNOWN'), err)
				reject(err)
			}

			return (startPromise) ?
				startPromise.then(executeFn).catch(handleError) :
				Promise.resolve(executeFn).catch(handleError)

		})

	}

	/**
	 * Reset the coordinator status
	 *
	 * @returns {Coordinator.reset}
	 */
	export function reset():Promise<ICoordinator> {
		if (startPromise)
			(startPromise as any).cancel()

		return Promise
			.map(stores(), (store:IStorePlugin) => store.stop())
			.return(this)
			.finally(() => {
				startPromise = null
				plugins.length = 0
				initialized = false
			}) as Promise<ICoordinator>

	}

	/**
	 * Register a model with the system
	 *
	 * @param clazzName
	 * @param constructor
	 * @param opts
	 */
	export function registerModel(constructor:Function) {
		checkStarted(true)

		let model = getModel(constructor)
		if (model) {
			log.info(`Trying to register ${model.name} a second time? is autoregister enabled?`)
			return
		}

		const modelOpts:IModelOptions = Reflect.getMetadata(TypeStoreModelKey,constructor)
		model = {
			options: modelOpts,
			name: modelOpts.clazzName,
			clazz: constructor
		}

		modelMap[modelOpts.clazzName] = model
		models.push(model)


	}


	/**
	 * Get a repository for the specified model/class
	 *
	 * @param clazz
	 * @returns {T}
	 */
	export function getRepo<T extends Repo<M>,M extends IModel>(clazz:{new(): T; }):T {
		const repo = new clazz()
		stores().forEach((store) => store.initRepo(repo))
		repo.start()
		return repo
	}

}

/**
 * Internal vals
 *
 * @type {{}}
 */
const internal:any = {}

/**
 * Add getter/setters
 */
Object.defineProperties(Coordinator,{
	startPromise: {
		set: (newVal:any) => {
			internal.startPromise = newVal
		},
		get: () => {
			return internal.startPromise
		},
		configurable: false
	},
	started: {
		get: () => {
			const startPromise = internal.startPromise
			return internal.startPromise !== null && startPromise.isResolved()
		},
		configurable: false
	}
})

/**
 * Management service
 */
// export const Service = {

// 	/**
// 	 * Save a persistable model
// 	 */
// 	save<T extends PersistableModel>(model:T):T {

// 		return null
// 	},


// 	get<T,K>(key:K):T {

// 		return null
// 	}
// }
