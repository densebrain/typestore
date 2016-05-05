
import 'reflect-metadata'

import * as _ from 'lodash'
import * as Log from './log'

import {Manager} from './Manager'
import {IModelOptions, IRepoOptions, IModelAttributeOptions, IRepo, IModelClass} from './Types'
import {DynoFinderKey, DynoFindersKey} from "./Constants";

const log = Log.create('ModelDecorations')



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
		_.defaults(opts,{
			clazzName: (constructor as any).name
		})


		log.debug('Decorating: ', opts.clazzName)
		Manager.registerModel(opts.clazzName,constructor,opts as IModelOptions)
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

export function FinderDescriptor() {

	return function(target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
		const finderOpts:any = Reflect.getMetadata(DynoFinderKey,descriptor)
		const finderKey = `${DynoFinderKey}:${propertyKey}`

		// Now add the finders to the repo metadata
		const finders = Reflect.getMetadata(DynoFindersKey,target) || []
		finders.push(finderOpts)
		Reflect.defineMetadata(target,finders,DynoFindersKey)
		return descriptor
	}
}


export function NotImplemented() {
	// return function(target:any,propertyKey:string,descriptor:TypedPropertyDescriptor<any>) {
	// 	// descriptor.value = function () {
	// 	// 	throw new Error(`NotImplemented(${propertyKey}), must override`)
	// 	// }
	// 	//
	// 	// return descriptor
	// }
}





