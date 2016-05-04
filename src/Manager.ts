/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
import 'es6-shim'
import 'reflect-metadata'

import * as _ from 'lodash'
import * as assert from 'assert'

import Promise from './Promise'
import * as Log from './log'
import {DynoModelKey,DynoAttrKey} from './Constants'
import {IModelOptions,IAttributeOptions,IStore,IManagerOptions} from './Types'
import {msg, Strings} from "./Messages"


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
	let store:IStore

	/**
	 * Set the manager options
	 */
	export function init(newOptions:IManagerOptions):Promise<boolean> {
		checkStarted(true)
		checkInitialized(true)
		initialized = true

		options = options || newOptions
		_.assign(options,newOptions)

		store = options.store

		assert(store,msg(Strings.ManagerTypeStoreRequired))

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
		opts.attrs = Reflect.getOwnMetadata(DynoAttrKey, constructor.prototype) as IAttributeOptions[]

		// Define the metadata for the model
		Reflect.defineMetadata(DynoModelKey,opts,constructor.prototype)


		modelRegistrations[clazzName] = Object.assign({},opts,{
			clazz:constructor
		})



	}

	export function registerAttribute(target:any,propertyKey:string,opts:IAttributeOptions) {
		checkStarted(true)

		const attrType = Reflect.getMetadata('design:type',target,propertyKey)
		_.defaults(opts,{
			type:attrType,
			typeName: _.get(attrType,'name','unknown type'),
			key:propertyKey
		});

		log.info(`Decorating ${propertyKey}`,opts)
		const modelAttrs = Reflect.getMetadata(DynoAttrKey,target) || []
		modelAttrs.push(opts)
		Reflect.defineMetadata(DynoAttrKey,modelAttrs,target)
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
