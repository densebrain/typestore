import * as Log from '../log'
import {Coordinator} from '../Coordinator'
import {IRepoOptions, IModel, IFinderOptions} from '../Types'
import {
	TypeStoreFinderKey, 
	TypeStoreFindersKey, 
	TypeStoreAttrKey, 
	TypeStoreModelKey,
	TypeStoreRepoKey
} from "../Constants";
import {Repo} from "../Repo";
import {NoReflectionMetataError} from "../Errors";

const log = Log.create(__filename)

/**
 * Simple base model implementation
 * uses reflection to determine type
 */
export class DefaultModel implements IModel {
	get clazzType() {
		const type = Reflect.getOwnMetadata('design:type',this)
		if (!type)
			throw new NoReflectionMetataError('Unable to reflect type information')

		return type.name
	}
}

export interface IModelIndex {
	name:string
	isSecondaryKey?:boolean
	secondaryKey?:string
}

export interface IModelAttributeOptions {
	name?:string
	type?:any
	typeName?:string
	primaryKey?:boolean
	secondaryKey?:boolean
	index?: IModelIndex
}

/**
 * Options provided to model
 * decorator annotation
 */
export interface IModelOptions {
	clazzName?:string
	clazz?:any
	tableName:string
	attrs?:IModelAttributeOptions[]
}

export interface IModelKey {

}

export interface IKeyValue {

}


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
		log.debug('attr type = ',propertyKey,attrType)
		opts = Object.assign({},{
			type:attrType,
			name: propertyKey,
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
