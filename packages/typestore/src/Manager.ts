import 'reflect-metadata'

import Promise = require('./Promise')
import * as assert from 'assert'


import * as Log from './log'
import {DynoModelKey,DynoAttrKey} from './Constants'
import {IModelOptions, IModelAttributeOptions, IStore, IManagerOptions, IModelMapper} from './Types'
import {msg, Strings} from "./Messages"
import {Repo} from "./Repo";
import {ModelMapper} from "./ModelMapper";


const log = Log.create(__filename)

export namespace Manager {

	/**
	 * Model registration map type
	 */
	export type TModelRegistrations = {[clazzName:string]:IModelOptions}


	/**
	 * Stores all registrations, enabling
	 * them to be configured against a
	 * changed client, multiple datasources,
	 * utility scripts, etc
	 *
	 * @type {{}}
	 */
	const modelRegistrations:TModelRegistrations = {}

	/**
	 * Retrieve model registrations
	 *
	 * @returns {TModelRegistrations}
	 */
	export function getModelRegistrations():TModelRegistrations {
		return modelRegistrations
	}

	export function findModelOptionsByClazz(clazz:any):IModelOptions {
		for (let clazzName of Object.keys(modelRegistrations)) {
			const modelReg = modelRegistrations[clazzName]
			if (modelReg.clazz === clazz) {
				return modelReg
			}
		}

		log.info('unable to find registered model for clazz',clazz,'in',Object.keys(modelRegistrations))
		return null
	}

	/**
	 * Default options
	 */
	let options:IManagerOptions

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

	/**
	 * Ref to aws client
	 */
	export let store:IStore

	/**
	 * Set the manager options
	 */
	export function init(newOptions:IManagerOptions):Promise<boolean> {
		checkStarted(true)
		checkInitialized(true)
		initialized = true

		// Update the default options
		options = options || newOptions
		Object.assign(options,newOptions)


		store = options.store

		// Make sure we got a valid store
		assert(store,msg(Strings.ManagerTypeStoreRequired))

		// Manager is ready, now initialize the store
		log.debug(msg(Strings.ManagerInitComplete))
		return store.init(this,options).return(true)
	}


	/**
	 * Start the manager and embedded store from options
	 *
	 * @returns {Bluebird<boolean>}
	 */
	export function start():Promise<boolean> {
		return startPromise = store.start()
			.catch((err) => {
				log.error(msg(Strings.ManagerFailedToStart),err)
				startPromise = null
				return false
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

			if (startPromise) {
				startPromise.then(executeFn).catch(handleError)
			} else {
				Promise.resolve(executeFn).catch(handleError)
			}
		})

	}

	/**
	 * Reset the manager status
	 *
	 * @returns {Manager.reset}
	 */
	export function reset() {
		if (startPromise)
			(startPromise as any).cancel()

		return Promise.resolve(store ? store.stop() : true).then(() =>{
			log.info(`Store successfully stopped`)
			return true
		}).finally(() => {
			store = startPromise = null
			if (options) options.store = null
			initialized = false
		})

	}



	/**
	 * Register a model with the system
	 *
	 * @param clazzName
	 * @param constructor
	 * @param opts
	 */
	export function registerModel(clazzName:string,constructor:Function,opts:IModelOptions) {
		checkStarted(true)

		// Retrieve its attributes first
		opts.attrs = Reflect.getOwnMetadata(DynoAttrKey, constructor.prototype) as IModelAttributeOptions[]

		// Define the metadata for the model
		Reflect.defineMetadata(DynoModelKey,opts,constructor.prototype)

		modelRegistrations[clazzName] = Object.assign({},opts,{
			clazz:constructor
		})

	}

	/**
	 * Register an attribute
	 *
	 * @param target
	 * @param propertyKey
	 * @param opts
	 */
	export function registerAttribute(target:any,propertyKey:string,opts:IModelAttributeOptions) {
		checkStarted(true)

		log.info(`Decorating ${propertyKey}`,opts)
		const modelAttrs = Reflect.getMetadata(DynoAttrKey,target) || []
		modelAttrs.push(opts)
		Reflect.defineMetadata(DynoAttrKey,modelAttrs,target)
	}

	/**
	 * Get a repository for the specified model/class
	 *
	 * @param clazz
	 * @returns {T}
	 */
	export function getRepo<T extends Repo<M>,M>(clazz:{new(): T; }):T {
		return store.getRepo(clazz)
	}

	export function getMapper<M>(clazz:{new():M;}):IModelMapper<M> {
		return new ModelMapper(clazz)
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
Object.defineProperties(Manager,{
	store: {
		set: (newVal:IStore) => {
			internal.store = newVal
		},
		get: () => {
			return internal.store
		},
		configurable: false
	},
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
