import Promise = require('bluebird')


import 'reflect-metadata'


import * as Log from './log'

import {Manager} from './Manager'
import {IModelOptions, IRepoOptions, IModelAttributeOptions, IModelClass} from './Types'
import {DynoFinderKey, DynoFindersKey} from "./Constants";
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

		const finalOpts = Object.assign({},{
			clazzName: type.name
		},opts)


		log.debug('Decorating: ', finalOpts.clazzName)
		Manager.registerModel(finalOpts.clazzName,constructor,finalOpts)
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
			typeName: attrType.name || 'unknown type',
			key:propertyKey
		},opts)

		Manager.registerAttribute(target,propertyKey,opts)
	}
}


/**
 * Decorate the repo for a given model
 *
 * @param opts for the repository
 * @return {function(Function)}
 */
export function RepoDescriptor(opts?:IRepoOptions) {


	return function (constructor:Function) {


	}
}

/**
 * Describe a finder function that has to be implemented by the store
 *
 * @returns {function(any, string, TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any>}
 */
export function FinderDescriptor() {

	return function<R extends Repo<any>>(
		target:R,
		propertyKey:string,
		descriptor:TypedPropertyDescriptor<any>
	) {
		// Now add the finders to the repo metadata
		const finders = Reflect.getMetadata(DynoFindersKey,target) || []
		finders.push(propertyKey)
		Reflect.defineMetadata(DynoFindersKey,finders,target)
		//return descriptor
	}
}





