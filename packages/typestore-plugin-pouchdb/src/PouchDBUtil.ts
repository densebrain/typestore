import {Log,isString,IModelMapper,IModel,IModelType,getDefaultMapper,isFunction,ModelMapper} from 'typestore'

import {
	PouchDBAttributePrefix, PouchDBReservedFields, PouchDBOperators,
	PouchDBPrefixEndChar
} from './PouchDBConstants'
import {PouchDBKeyValue, PouchDBRepoPlugin} from './PouchDBRepoPlugin'


/**
 * RegEx for matching model mapping prefix
 *
 * @type {RegExp}
 */
const
	attrRegex = new RegExp(`^${PouchDBAttributePrefix}`,'g'),
	log = Log.create(__filename)


export function makePrefixEndKey(startKey:string) {
	return startKey + PouchDBPrefixEndChar
}

export function mkdirp(filename,skipLast = false) {
	const
		fs = require('fs'),
		parts = filename.split('/')
			
	if (skipLast)
		parts.pop()
			
	parts
		.reduce((fullPath,nextPart) => {
			if (nextPart && nextPart.length) {
				fullPath += '/' + nextPart
				
				log.info(`Checking path ${fullPath}`)
				if (!fs.existsSync(fullPath)) {
					log.info(`Creating path ${fullPath}`)
					fs.mkdirSync(filename)
				}
			}
			
			return fullPath
		},'')
}

/**
 * Clean field prefixes
 *
 * @param fields
 * @returns {string[]}
 */
export function cleanFieldPrefixes(fields:string[]) {
	return fields.map(field => field.replace(attrRegex,''))
}

/**
 * Filter reserved words in selector field names
 *
 * @param fields
 * @returns {string[]}
 */
export function filterReservedFields(fields:string[]) {
	return fields.filter(field => !PouchDBReservedFields.includes(field))
}

/**
 * Ma attributes to fields
 *
 * @param fields
 * @returns {string[]}
 */
export function mapAttrsToField(fields:string[]) {
	return cleanFieldPrefixes(filterReservedFields(fields))
		.map(field => `${PouchDBAttributePrefix}${field}` )
}

/**
 * Wrap a pouch key
 *
 * @param repo
 * @param primaryKeyAttribute
 * @param o
 * @returns {string}
 */
export function dbKeyFromObject(repo:PouchDBRepoPlugin<any>,primaryKeyAttribute:string,o:any):string {
	const
		{keyMapper} = repo.modelOptions,
		key = keyMapper ? keyMapper(o) : o[primaryKeyAttribute]
	
	return (key) ? '' + key : null
}

/**
 * Unwrap a key from pouch to the external key
 *
 * @param repo
 * @param key
 * @returns {any}
 */
export function dbKeyFromKey(repo:PouchDBRepoPlugin<any>,key:PouchDBKeyValue) {
	const
		keyVal  = key.args[0],
		{keyUnwrap} = repo.modelOptions
	return keyUnwrap ? keyUnwrap(keyVal) : keyVal
}


/**
 * Covert a model to a doc
 *
 * @param repo
 * @param modelType
 * @param modelMapper
 * @param primaryKeyAttribute
 * @param model
 * @returns {{_id, _rev, attrs}|any}
 */
export function convertModelToDoc(
	repo:PouchDBRepoPlugin<any>,
	modelType:IModelType,
	modelMapper:IModelMapper<any>,
	primaryKeyAttribute:string,
	model:any
) {
	const
		json = modelMapper.toObject(model),
		doc = model.$$doc || {} as any

	if (!doc._id) {
		const
			key = dbKeyFromObject(repo,primaryKeyAttribute,model)
		
		if (key)
			doc._id = key
	}


	doc.type = modelType.name
	doc.attrs = Object.assign({},json)
	delete doc.attrs['$$doc']

	return doc
}


/**
 * Map docs to models
 *
 * @param pouchRepo
 * @param modelClazz
 * @param result
 * @param includeDocs
 * @returns {any}
 */
export function mapDocs<M extends IModel>(pouchRepo:PouchDBRepoPlugin<any>,modelClazz:{new():M},result:any,includeDocs = true):M[]|number[]|string[] {
	
	let docs =
		(!result) ? [] :
			result.docs && Array.isArray(result.docs) ? result.docs :
				result.rows && Array.isArray(result.rows) ? result.rows :
					result
	
	// Make sure we have an array
	docs = !docs ? [] : !Array.isArray(docs) ? [docs] : docs

	// if we only want the ids then return only the ids
	if (includeDocs === false) {
		return docs.map(doc => {
			let val =
				isString(doc) ? doc :
				(doc && doc.attrs) ?
					doc.attrs[pouchRepo.primaryKeyField] :
					(doc && doc._id) ? doc._id :
					(doc && doc.id) ? doc.id :
					doc

			let pkType =
				pouchRepo.primaryKeyType
			
			val =
				(pkType === String) ?
					val :
				(pkType === Number) ?
					parseInt(val,10) :
					(isFunction(pkType)) ? new pkType(val) :
						val
			
			return val
		})
	}

	const
		mapper = getDefaultMapper(modelClazz)
	
	return docs.map(doc => mapper.fromObject(doc.attrs,(o, model) => {
		(model as any).$$doc = doc
		return model
	}))


}

/**
 * Pick specific attributes from an object
 *
 * @param obj
 * @param props
 * @returns {any}
 */
export function pick(obj:any,...props) {
	return props.reduce((result,prop) => {
		result[prop] = obj[prop]
		return result
	},{})
}

/**
 * Prepends all keys - DEEP
 * with `attrs.` making field reference easier
 *
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