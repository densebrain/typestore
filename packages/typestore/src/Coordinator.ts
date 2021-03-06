import './Globals'

import * as Log from './log'
import {TypeStoreModelKey} from './Constants'
import {
	IStorePlugin,
	ICoordinatorOptions,
	IModel,
	IModelType,
	CoordinatorOptions,
	ICoordinator,
	IPlugin, PluginType
} from './Types'
import {msg, Strings} from "./Messages"
import {Repo} from "./Repo";
import {PluginFilter, assert, PromiseMap} from "./Util";
import {IModelOptions} from "./decorations/ModelDecorations";
import {PluginEventType} from "./PluginTypes";
import { isNil } from "typeguard"

// Create logger
const
	Bluebird = require('bluebird'),
	log = Log.create(__filename)

Promise = Bluebird

/**
 * ClassName -> ModelClass Mapping table
 */
export type TModelTypeMap = {[clazzName:string]:IModelType}


/**
 * The overall coordinator
 */
export class Coordinator implements ICoordinator {

	private plugins:IPlugin[] = []

	notify(eventType:PluginEventType,...args:any[]) {
		this.plugins.forEach(plugin => plugin.handle(eventType,...args))
	}

	/**
	 * Model registration map type
	 */



	/**
	 * Stores all registrations, enabling
	 * them to be configured against a
	 * changed client, multiple datasources,
	 * utility scripts, etc
	 *
	 * @type {{}}
	 */

	private modelMap:TModelTypeMap = {}
	private models:IModelType[] = []


	/**
	 * Retrieve model registrations
	 *
	 * @returns {TModelTypeMap}
	 */
	getModels():IModelType[] {
		return this.models
	}

	private findModel(predicate) {
		for (let modelType of this.models) {
			if (predicate(modelType)) {
				return modelType
			}
		}

		log.debug('unable to find registered model for clazz in',Object.keys(this.modelMap))
		return null
	}

	getModel(clazz:any):IModelType {
		return this.findModel((model) => model.clazz === clazz)
	}

	getModelByName(name:string):IModelType {
		return this.findModel((model) => model.name === name)
	}

	/**
	 * Default options
	 */
	private options:ICoordinatorOptions = new CoordinatorOptions(null)

	getOptions() {
		return this.options
	}


	private initialized = false

	// NOTE: settled and settling Promise are overridden properties - check below namespace

	private startPromise:Promise<any> = null
	private internal = {
		started:false
	}
	get started() {
		return this.startPromise !== null && this.internal.started
	}

	set started(newVal:boolean) {
		this.internal.started = newVal
	}



	private checkInitialized(not:boolean = false) {
		this.checkStarted(true)
		assert(not ? !this.initialized : this.initialized,
			msg(not ? Strings.ManagerInitialized : Strings.ManagerNotInitialized))
	}



	private checkStarted(not:boolean = false) {
		const valid = (not) ? !this.started : this.started

		assert(valid, msg(not ? Strings.ManagerSettled : Strings.ManagerNotSettled))
	}

	stores() {
		return PluginFilter<IStorePlugin>(this.plugins,PluginType.Store)
	}



	/**
	 * Set the coordinator options
	 */
	init(newOptions:ICoordinatorOptions, ...newPlugins:IPlugin[]):Promise<ICoordinator> {
		this.checkStarted(true)
		this.checkInitialized(true)
		this.initialized = true
		this.plugins.push(...newPlugins)

		// Update the default options
		this.options = this.options || newOptions
		Object.assign(this.options,newOptions)


		// Make sure we got a valid store
		assert(this.stores().length > 0,msg(Strings.ManagerTypeStoreRequired))

		// Coordinator is ready, now initialize the store
		log.debug(msg(Strings.ManagerInitComplete))
		return Bluebird.all(
			this.plugins
				.filter(plugin => !isNil(plugin))
				.map(plugin => plugin.init(this,this.options))
		).return(this)

	}



	/**
	 * Start the coordinator and embedded store from options
	 *
	 * @returns {Bluebird<boolean>}
	 */
	start(...models):Promise<ICoordinator> {
		this.checkStarted(true)
		models.forEach(model => this.registerModel(model))

		this.startPromise = PromiseMap(this.plugins, plugin => plugin && plugin.start())

		return Bluebird.resolve(this.startPromise)
			.return(this)
			.catch(err => {
				log.error('failed to start coordinator',err)
				throw err
			})
			.finally(() => {
				this.started = true
				this.startPromise = null
			})


	}

	async stop():Promise<ICoordinator> {
		if (!this.started)
			return this

		try {
			await (this.startPromise) ?
				this.startPromise.then(this.stopPlugins.bind(this)) :
				this.stopPlugins()
		} catch (err) {
			log.error(`Coordinator shutdown was not clean`)
		} finally {
			this.startPromise = null
			this.started = false
			this.initialized = false
			this.plugins = []
			this.models = []
			this.modelMap = {}
		}
		return this
	}


	/**
	 * Execute function either immediately if
	 * ready or when the starting Promise
	 * completes
	 *
	 * @param fn
	 */
	async execute<T>(fn:Function):Promise<T> {
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

			return (this.startPromise) ?
				this.startPromise.then(executeFn).catch(handleError) :
				Promise.resolve(executeFn).catch(handleError)

		})

	}

	async stopPlugins() {
		await PromiseMap(this.plugins, plugin => (plugin) && plugin.stop())
	}

	/**
	 * Reset the coordinator status
	 *
	 * @returns {Coordinator.reset}
	 */
	async reset():Promise<ICoordinator> {
		await this.stop()


		return this

	}

	/**
	 * Register a model with the system
	 *
	 * @param constructor
	 */
	registerModel(constructor:Function) {
		this.checkStarted(true)

		let model = this.getModel(constructor)
		if (model) {
			log.debug(`Trying to register ${model.name} a second time? is autoregister enabled?`)
			return
		}

		const modelOpts:IModelOptions = Reflect.getMetadata(TypeStoreModelKey,constructor)
		if (!modelOpts) {
			log.info(`Can not register a model without metadata ${(constructor && constructor.name) || 'unknown'}`)
			return
		}

		model = {
			options: modelOpts,
			name: modelOpts.clazzName,
			clazz: constructor
		}

		this.modelMap[modelOpts.clazzName] = model
		this.models.push(model)
		this.notify(PluginEventType.ModelRegister,model)
		return this
	}


	private repoMap = new WeakMap<any,any>()

	/**
	 * Get a repository for the specified model/class
	 *
	 * @param clazz
	 * @returns {T}
	 */
	getRepo<T extends Repo<M>,M extends IModel>(clazz:{new(): T; }):T {
		let repo:T = this.repoMap.get(clazz)
		if (repo)
			return repo

		repo = new clazz()
		repo.init(this)

		this.notify(PluginEventType.RepoInit,repo)

		repo.start()
		this.repoMap.set(clazz,repo)
		return repo
	}

}
