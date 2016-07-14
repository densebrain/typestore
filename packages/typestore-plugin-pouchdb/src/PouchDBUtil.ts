import {IModelMapper,IModel,IModelType,getDefaultMapper,isFunction,ModelMapper} from 'typestore'

import {PouchDBAttributePrefix, PouchDBReservedFields, PouchDBOperators} from './PouchDBConstants'
import {PouchDBKeyValue, PouchDBRepoPlugin} from './PouchDBRepoPlugin'

const attrRegex = new RegExp(`^${PouchDBAttributePrefix}`,'g')

export function cleanFieldPrefixes(fields:string[]) {
	return fields.map(field => field.replace(attrRegex,''))
}


export function filterReservedFields(fields:string[]) {
	return fields.filter(field => !PouchDBReservedFields.includes(field))
}

export function mapAttrsToField(fields:string[]) {
	return cleanFieldPrefixes(filterReservedFields(fields))
		.map(field => `${PouchDBAttributePrefix}${field}` )
}

export function keyFromObject(o:any):PouchDBKeyValue {
	return new PouchDBKeyValue(o[this.primaryKeyAttr])
}

export function dbKeyFromObject(primaryKeyAttribute:string,o:any):string {
	const key = o[primaryKeyAttribute]
	return (key) ? '' + key : null
}

export function dbKeyFromKey(key:PouchDBKeyValue) {
	return key.args[0]
}



export function convertModelToDoc(
	modelType:IModelType,
	modelMapper:IModelMapper<any>,
	primaryKeyAttribute:string,
	model:any
) {
	const json = modelMapper.toObject(model)
	const doc = model.$$doc || {} as any

	if (!doc._id) {
		const key = dbKeyFromObject(primaryKeyAttribute,model)
		if (key)
			doc._id = key
	}


	doc.type = modelType.name
	doc.attrs = Object.assign({},json)
	delete doc.attrs['$$doc']

	return doc
}

export function mapDocs<M extends IModel>(pouchRepo:PouchDBRepoPlugin<any>,modelClazz:{new():M},result:any,includeDocs = true):M[]|number[]|string[] {


	//const mapper = new ModelMapper(modelClazz)

	let docs = (result && Array.isArray(result)) ? result : result.docs
	docs = docs || []

	// if we only want the ids then return only the ids
	if (includeDocs === false) {
		return docs.map(doc => {
			let val = (doc && doc.attrs) ?
				doc.attrs[pouchRepo.primaryKeyField] :
				(doc && doc._id) ? doc._id :
				(doc && doc.id) ? doc.id :
				doc

			let pkType = pouchRepo.primaryKeyType
			if (pkType === Number) {
				val = parseInt(val,10)
			} else if (isFunction(pkType)) {
				val = new pkType(val)
			}

			return val
		})
	}

	const mapper = getDefaultMapper(modelClazz)
	return docs.map(doc => mapper.fromObject(doc.attrs,(o, model) => {
		(model as any).$$doc = doc
		return model
	}))


}

export function pick(obj:any,...props) {
	return props.reduce((result,prop) => {
		result[prop] = obj[prop]
		return result
	},{})
}

/**
 * Prepends all keys - DEEP
 * with `attrs.` making field reference easier
 * @param o
 * @returns {{}}
 */
export function transformDocumentKeys(o) {
	return (!o) ? o :
		(Array.isArray(o)) ?
			o.map(aVal => transformDocumentKeys(aVal)) :
			(typeof o === "object") ?
				Object
					.keys(o)
					.reduce((newObj,nextKey) => {
						const nextVal = o[nextKey]

						nextKey = PouchDBOperators.includes(nextKey) ?
							nextKey : `${PouchDBAttributePrefix}${nextKey}`

						newObj[nextKey] = transformDocumentKeys(nextVal)

						return newObj
					},{}) :
				o

}