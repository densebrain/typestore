import {NoReflectionMetataError} from "./Errors";
export interface IModel {
	clazzType:string
}

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
	isAlternateRangeKey?:boolean
	rangeKey?:string
}

export interface IModelAttributeOptions {
	name?:string
	type?:any
	hashKey?:boolean
	rangeKey?:boolean
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
 * Model definition
 */
export interface IModelType {
	options:IModelOptions
	name:string
	clazz:any
}