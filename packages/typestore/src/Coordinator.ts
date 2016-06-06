import 'reflect-metadata'
import './Globals'

Promise = require('bluebird')

import assert = require('assert')
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
import {PluginFilter, PromiseMap} from "./Util";
import {IModelOptions} from "./decorations/ModelDecorations";
import {PluginEventType} from "./PluginTypes";

// Create logger
const log = Log.create(__filename)

export type TModelTypeMap = {[clazzName:string]:IModelType}

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

	// NOTE: settled and settling Promise are overriden properties - check below namespace

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
	async init(newOptions:ICoordinatorOptions, ...newPlugins:IPlugin[]):Promise<ICoordinator> {
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
		await PromiseMap(this.plugins, async (plugin) =>  {
			if (plugin)
				await plugin.init(this,this.options)
		})
		return this
	}



	/**
	 * Start the coordinator and embedded store from options
	 *
	 * @returns {Bluebird<boolean>}
	 */
	async start(...models):Promise<ICoordinator> {
		this.checkStarted(true)
		models.forEach(this.registerModel.bind(this))

		try {
			this.startPromise = PromiseMap(this.plugins, plugin => (plugin) && plugin.start())
			await this.startPromise
		} finally {
			this.started = true
			this.startPromise = null
		}
		return this

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
	 * @param clazzName
	 * @param constructor
	 * @param opts
	 */
	registerModel(constructor:Function) {
		this.checkStarted(true)

		let model = this.getModel(constructor)
		if (model) {
			log.debug(`Trying to register ${model.name} a second time? is autoregister enabled?`)
			return
		}

		const modelOpts:IModelOptions = Reflect.getMetadata(TypeStoreModelKey,constructor)
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


	/**
	 * Get a repository for the specified model/class
	 *
	 * @param clazz
	 * @returns {T}
	 */
	getRepo<T extends Repo<M>,M extends IModel>(clazz:{new(): T; }):T {
		const repo = new clazz()
		repo.init(this)

		this.notify(PluginEventType.RepoInit,repo)

		repo.start()
		return repo
	}

}
