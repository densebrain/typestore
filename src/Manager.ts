/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

import 'reflect-metadata'
import * as AWS from 'aws-sdk'
import * as _ from 'lodash'
import * as assert from 'assert'

import * as Log from './log'
import {Client} from './Client'
import {DynoModelKey,DynoAttrKey} from './Constants'
import {IModelOptions,IAttributeOptions,IManagerOptions} from './Types'

const log = Log.create(__filename)




export namespace Manager {




	const models:any = {}

	/**
	 * Default options
	 */
	const options:IManagerOptions = {
		createTables: true
	}

	let ready = false

	/**
	 * Ref to aws client
	 */
	let client:Client

	/**
	 * Set the manager options
	 */
	export function init(newOptions:IManagerOptions) {
		ready = true

		_.assign(options,newOptions)

		client = new Client(options)
	}


	function checkReady() {
		assert(ready,'The system must be initialized before registering models, etc')
	}

	/**
	 * Register a model with the system
	 *
	 * @param clazzName
	 * @param constructor
	 * @param opts
	 */
	export function registerModel(clazzName:string,constructor:Function,opts:IModelOptions) {
		checkReady()

		// Retrieve its attributes first
		opts.attrs = Reflect.getOwnMetadata(DynoAttrKey, constructor.prototype) as IAttributeOptions[]

		// Define the metadata for the model
		Reflect.defineMetadata(DynoModelKey,opts,constructor.prototype)


		models[clazzName] = _.assign({},opts,{
			clazz:constructor
		})
	}

	export function registerAttribute(target:any,propertyKey:string,opts:IAttributeOptions) {
		checkReady()

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
