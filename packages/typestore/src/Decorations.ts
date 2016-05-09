import Promise = require('bluebird')
import 'reflect-metadata'

import * as Log from './log'
import {Manager} from './Manager'
import {IModelOptions, IRepoOptions, IModelAttributeOptions, IModel, IFinderOptions} from './Types'
import {
	TypeStoreFinderKey, TypeStoreFindersKey, TypeStoreAttrKey, TypeStoreModelKey,
	TypeStoreRepoKey
} from "./Constants";
import {Repo} from "./Repo";

const log = Log.create(__filename)



/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 *
 * @param {opts:IModelOptions} Options for this model generation
 */
export function ModelDescriptor(opts:IModelOptions) {
	return function(constructor:Function) {
		// Make sure everything is valid
		//const type = Reflect.getOwnMetadata('design:type',constructor)
		const type = constructor as any
		const attrs = Reflect.getOwnMetadata(TypeStoreAttrKey, constructor) as IModelAttributeOptions[]
		
		const finalOpts = Object.assign({},{
			clazzName: type.name,
			attrs
		},opts)


		log.debug('Decorating: ', finalOpts.clazzName)
		Reflect.defineMetadata(TypeStoreModelKey,finalOpts,constructor)

		//if (Manager.getOptions().autoRegisterModels)
		Manager.registerModel(constructor)
	}
}


/**
 * Decorator model attribute
 * @param opts
 * @returns {function(any, string): undefined}
 * @constructor
 */
export function AttributeDescriptor(opts: IModelAttributeOptions) {
	return function (target:any,propertyKey:string) {
		const attrType = Reflect.getMetadata('design:type',target,propertyKey)
		
		opts = Object.assign({},{
			type:attrType,
			typeName: (attrType && attrType.name) ? attrType.name : 'unknown type',
			key:propertyKey
		},opts)

		// Update the attribute array
		log.debug(`Decorating ${propertyKey}`,opts)
		const modelAttrs = Reflect.getMetadata(TypeStoreAttrKey,target.constructor) || []
		modelAttrs.push(opts)

		Reflect.defineMetadata(TypeStoreAttrKey,modelAttrs,target.constructor)
	}
}


/**
 * Decorate the repo for a given model
 *
 * @param opts for the repository
 * @return {function(Function)}
 */
export function RepoDescriptor(opts:IRepoOptions = {}) {


	return function (constructor:Function) {
		Reflect.defineMetadata(TypeStoreRepoKey,opts,constructor)
	}
}

/**
 * Describe a finder function that has to be implemented by the store
 *
 * @returns {function(any, string, TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any>}
 */
export function FinderDescriptor(opts:IFinderOptions = {}) {

	return function<R extends Repo<any>>(
		target:R,
		propertyKey:string,
		descriptor:TypedPropertyDescriptor<any>
	) {
		// Add the options to metadata
		Reflect.defineMetadata(TypeStoreFinderKey,opts,target,propertyKey)

		// Now add the finders to the repo metadata
		const finders = Reflect.getMetadata(TypeStoreFindersKey,target) || []
		finders.push(propertyKey)
		Reflect.defineMetadata(TypeStoreFindersKey,finders,target)
		//return descriptor
	}
}







