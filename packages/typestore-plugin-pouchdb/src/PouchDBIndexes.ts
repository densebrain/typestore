//const PouchDB = require('pouchdb')
//import * as PouchDB from 'pouchdb'
import {isString} from 'typestore'
import {cleanFieldPrefixes,filterReservedFields,mapAttrsToField} from './PouchDBUtil'

const log = require('typelogger').create(__filename)

let cachedIndexMapPromise = null

export interface PouchDBMangoIndexConfig {
	name:string
	direction:string
	fields:string[]
}

export interface IPouchDBIndex {
	name:string,
	index:number,
	def:any,
	fields:string[]
}

export type TPouchDBIndexMap = {[idxName:string]:IPouchDBIndex}

async function updateCachedIndexMap(db) {

	try {
		const indexesResult = await db.getIndexes()

		return indexesResult.indexes.reduce((map,index,i) => {
			map[index.name] = {
				index:  i,
				name:   index.name,
				def:    index,
				fields: index.def.fields.reduce((fieldList, nextFieldDef) => {
					fieldList.push(...Object.keys(nextFieldDef))
					return fieldList
				}, [])
			}

			return map

		},{})

	} catch (err) {
		log.error('index map failed try/catch', err)
	}

	return {}
}

/**
 * Get the current index map
 * - unless forced a cache version will be
 *  returned when available
 * @param db
 * @param force
 * @returns {null}
 */
export function getIndexMap(db,force = false):Promise<TPouchDBIndexMap> {
	log.debug('Getting indexes, force=',force)


	if (force || !cachedIndexMapPromise) {
		cachedIndexMapPromise = updateCachedIndexMap(db)
	}

	return cachedIndexMapPromise

}

/**
 * Compare index fields
 *
 * @param idx
 * @param fields
 * @returns {boolean}
 */
function indexFieldsMatch(idx:IPouchDBIndex,fields:string[]) {
	const
		f1 = cleanFieldPrefixes(filterReservedFields(idx.fields)),
		f2 = cleanFieldPrefixes(filterReservedFields(fields))

	return Array.isEqual(
		f1,
		f2,
		true
	)
}

/**
 * Get an index by name
 *
 * @param db
 * @param indexName
 * @param fields
 * @returns {IPouchDBIndex}
 */
export async function  getIndexByNameOrFields(db,indexName:string,fields:string[]|any[]) {
	const idxMap = await getIndexMap(db)

	if (idxMap[indexName] || !fields || !fields.length)
		return idxMap[indexName]

	fields = cleanFieldPrefixes(fields)

	const
		idxNames = Object.keys(idxMap),
		existingIdxName = idxNames.find(idxName => {
			const idx = idxMap[idxName]
			return indexName === idxName || indexFieldsMatch(idx,fields)
		})
	return idxMap[existingIdxName]

}

export function makeMangoIndexConfig(modelName:string,indexName:string,indexDirection:string,fields:string[]) {
	const name = `${modelName ? modelName + '_' : ''}${indexName}`

	fields = [...mapAttrsToField(fields),'type']

	return {name,direction:indexDirection,fields}
}

/**
 * Create an index directly
 *
 * @param db
 * @param indexConfig
 */
async function makeMangoIndex(db,indexConfig:PouchDBMangoIndexConfig)
/**
 * Create an index config and then index
 *
 * @param db
 * @param modelName
 * @param indexName
 * @param fields
 */
async function makeMangoIndex(db,modelName:string, indexName:string,indexDirection:string,fields:string[])
async function makeMangoIndex(db,indexConfigOrModelName:string|PouchDBMangoIndexConfig, indexName?:string,indexDirection?:string,fields?:string[]) {

	// Make sure we have a valid index config first thing
	const indexConfig = (!indexConfigOrModelName || isString(indexConfigOrModelName)) ?
		makeMangoIndexConfig(<string>indexConfigOrModelName, indexName,indexDirection, fields) :
		indexConfigOrModelName


	indexName = indexConfig.name

	log.info(`Checking index ${indexName} with fields`,fields)

	let idx:IPouchDBIndex = await getIndexByNameOrFields(db, indexName, fields)

	if (idx && (idx.name !== indexName || indexFieldsMatch(idx, fields))) {
		log.info(`Index def has not changed: ${indexName}`)

	} else {

		/**
		 * Local fn to create the index
		 *
		 * @returns {any}
		 */


		//return doCreate()
		if (idx) {
			const deleteResult = await db.deleteIndex(idx.def)
			log.info(`Index changed, deleting old version: ${indexName}`,deleteResult)
		}

		const createRequest = Object.assign({},indexConfig,{
			fields: indexConfig.fields.map(field => ({[field]: indexConfig.direction || 'asc'}))
		})
		const createResult = await db.createIndex(createRequest)

		log.info(`Create result for ${indexName}`,createResult)
		const updatedIdxMap = await getIndexMap(db, true)
		idx = updatedIdxMap[indexName]

	}

	return idx


}

export {
	makeMangoIndex
}