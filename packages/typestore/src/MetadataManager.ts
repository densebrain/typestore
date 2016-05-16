import 'reflect-metadata'
import {ReturnTypeKey, TypeKey} from "./Constants"
const log = require('./log').create(__filename)


/**
 * Simple pass thru to define metadata
 *
 * @param metadataKey
 * @param metadata
 * @param target
 * @param targetKey
 */
export function setMetadata(metadataKey:string,metadata:any,target:any,targetKey?:string) {
	Reflect.defineMetadata(metadataKey,metadata,target,targetKey)
}

/**
 * Get metadata 
 * 
 * @param metadataKey
 * @param target
 * @param targetKey
 * @returns {any}
 */
export function getMetadata(metadataKey:string,target:any,targetKey?:string) {
	return Reflect.getMetadata(metadataKey,target,targetKey)
}

export function makeMetadataGetter(metadataKey:string):(target:any,targetKey:string) => any {
	return function(target:any,targetKey:string) {
		return Reflect.getMetadata(metadataKey,target,targetKey)
	}
}

export const  getMetadataReturnType = makeMetadataGetter(ReturnTypeKey)
export const  getMetadataType = makeMetadataGetter(TypeKey)


/**
 * Property decorator types for the decorator and the 
 * factories used with simple metadata
 */
export type MetadataPropertyDecorator = (target:any,propertyKey:string,descriptor:TypedPropertyDescriptor<any>) => any
export type MetadataPropertyDecoratorFactory<T> = (opts?:T) => MetadataPropertyDecorator


/**
 * Create a simple options decorator for things like finders
 * 
 * @param metadataKey
 * @param includeTargetKey
 * @param customizerFn
 * @returns {function(T=): function(any, string, TypedPropertyDescriptor<any>): undefined} 
 *  - in the customizer, opts is mutable
 */
export function makeOptionsDecorator<T>(
	metadataKey:string,
	includeTargetKey:boolean = true,
	customizerFn:(opts:T,target:any,targetKey:string) => any = null
):MetadataPropertyDecoratorFactory<T> {
	return (opts?:T) => {
		opts = opts || {} as T
		return (target:any,propertyKey:string,descriptor:TypedPropertyDescriptor<any>) => {
			
			// If a customizer was provided then use it
			// Pass all important items
			// NOTE: opts it mutable
			if (customizerFn)
				customizerFn(opts,target,propertyKey)
			
			setMetadata(metadataKey,opts,target,(includeTargetKey) ? propertyKey : undefined)
		}
	}
}
