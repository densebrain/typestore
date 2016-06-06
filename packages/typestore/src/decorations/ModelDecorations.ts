import * as Log from '../log'
import {
	TypeStoreAttrKey,
	TypeStoreModelKey
} from "../Constants";
import {getMetadataReturnType,getMetadataType,getMetadata,setMetadata} from '../MetadataManager'


const log = Log.create(__filename)

/**
 * Internal map for property values
 *
 * @type {WeakMap<any, any>}
 */
const propertyValues = new WeakMap<any,any>()

/**
 * Simply function to get retype object properties
 *
 * @param target
 * @returns {any}
 */
function getProps(target) {
	let props = propertyValues.get(target)
	if (!props) {
		props = {}
		propertyValues.set(target,props)
	}

	return props
}

/**
 * Attribute index configuration
 */
export interface IModelAttributeIndex {
	name:string
	unique?:boolean
	isSecondaryKey?:boolean
	secondaryKey?:string
}

/**
 * Model attribute options
 */
export interface IModelAttributeOptions {
	name?:string
	type?:any
	typeName?:string
	primaryKey?:boolean
	secondaryKey?:boolean
	index?: IModelAttributeIndex
	transient?:boolean
}

/**
 * Options provided to model
 * decorator annotation
 */
export interface IModelOptions {
	clazzName?:string
	clazz?:any
	onlyMapDefinedAttributes?:boolean
	tableName?:string
	attrs?:IModelAttributeOptions[]
	transientAttrs?:string[]
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
 * @param opts
 */
export function ModelDescriptor(opts:IModelOptions = {}) {
	return function(constructor:Function) {
		// Make sure everything is valid
		//const type = Reflect.getOwnMetadata('design:type',constructor)
		const type = constructor as any
		const attrs = Reflect.getOwnMetadata(TypeStoreAttrKey, constructor) as IModelAttributeOptions[]

		const finalOpts = Object.assign({},{
			clazz: constructor,
			clazzName: type.name,
			tableName: type.name,
			attrs
		},opts)


		log.debug(`Decorating: ${finalOpts.clazzName}`)
		Reflect.defineMetadata(TypeStoreModelKey,finalOpts,constructor)

	}
}

export type DefaultValueFn = (o:any) => any

export function DefaultValue(defaultValueFn:DefaultValueFn) {
	return function (target:any,propertyKey:string) {


		Object.defineProperty(target,propertyKey, {
			set: function(newVal) {
				const props = getProps(this)
				if (props[propertyKey] === newVal)
					return

				props[propertyKey] = newVal
			},
			get: function() {
				const props = getProps(this)

				let val = props[propertyKey]
				if (typeof val === 'undefined' || val == null) {
					val = props[propertyKey] = defaultValueFn(this)
				}

				return val
			}
		})
	}
}


/**
 * Decorator model attribute
 * @param opts
 * @returns {function(any, string): undefined}
 * @constructor
 */

export function AttributeDescriptor(opts:IModelAttributeOptions = {}) {
	return function (target:any,propertyKey:string) {
		const attrType = getMetadataType(target,propertyKey)
		opts = Object.assign({},{
			type:attrType,
			name: propertyKey,
			typeName: (attrType && attrType.name) ? attrType.name : 'unknown type',
			key:propertyKey
		},opts)

		// Update the attribute array
		const modelAttrs = getMetadata(TypeStoreAttrKey,target.constructor) || []
		modelAttrs.push(opts)

		setMetadata(TypeStoreAttrKey,opts,target.constructor,propertyKey)
		setMetadata(TypeStoreAttrKey,modelAttrs,target.constructor)
	}
}
