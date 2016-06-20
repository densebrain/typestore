//const PouchDB = require('pouchdb')
//import * as PouchDB from 'pouchdb'
import {Log,isString} from 'typestore'
import {cleanFieldPrefixes,filterReservedFields,mapAttrsToField} from './PouchDBUtil'
import {PouchDBAttributePrefix, PouchDBReservedFields} from './PouchDBConstants'


const log = Log.create(__filename)

let cachedIndexMap = null

export interface PouchDBMangoIndexConfig {
	name:string
	fields:string[]
}

export interface IPouchDBIndex {
	name:string,
	index:number,
	def:any,
	fields:string[]
}

export type TPouchDBIndexMap = {[idxName:string]:IPouchDBIndex}

export async function getIndexMap(db,force = false):Promise<TPouchDBIndexMap> {
	if (!force && cachedIndexMap)
		return cachedIndexMap

	const
		indexesResult = await db.getIndexes(),
		indexes = indexesResult.indexes

	return cachedIndexMap = indexes.reduce((map,index,i) => {
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
}


export function indexFieldsMatch(idx:IPouchDBIndex,fields:string[]) {
	return Array.isEqual(
		cleanFieldPrefixes(filterReservedFields(idx.fields)),
		cleanFieldPrefixes(fields),
		true
	)
}

export async function getIndexByNameOrFields(db,indexName:string,fields:string[]) {
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

export function makeMangoIndexConfig(modelName:string,indexName:string,fields:string[]) {
	const name = `${modelName ? modelName + '_' : ''}${indexName}`

	fields = ['type',...mapAttrsToField(fields)]

	return {name,fields}
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
async function makeMangoIndex(db,modelName:string, indexName:string,fields:string[])
async function makeMangoIndex(db,indexConfigOrModelName:string|PouchDBMangoIndexConfig, indexName?:string,fields?:string[]) {

	// Make sure we have a valid index config first thing
	const indexConfig = (!indexConfigOrModelName || isString(indexConfigOrModelName)) ?
		makeMangoIndexConfig(<string>indexConfigOrModelName, indexName,fields) :
		indexConfigOrModelName

	indexName = indexConfig.name

	let
		idxMap = await getIndexMap(db),
		idxNames = Object.keys(idxMap)

	let idx = await getIndexByNameOrFields(db,indexName,fields)

	if (idx && (idx.name !== indexName || indexFieldsMatch(idx,fields))) {
		log.info(`Index def has not changed: ${indexName}`)
	} else {
		if (idx) {
			log.info(`Index changed, deleting old version: ${indexName}`)
			await db.deleteIndex(idx.def)
		}

		log.info(`Index being created: ${indexName}`)
		const createResult = await db.createIndex({index: indexConfig})
		log.info(`Index created, result`,createResult)

		idxMap = await getIndexMap(db,true)
		idx = idxMap[indexName]
	}

	return idx
}

export {
	makeMangoIndex
}