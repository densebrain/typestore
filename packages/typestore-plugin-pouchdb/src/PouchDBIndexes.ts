//const PouchDB = require('pouchdb')
//import * as PouchDB from 'pouchdb'
import {isString} from 'typestore'
import {cleanFieldPrefixes,filterReservedFields,mapAttrsToField} from './PouchDBUtil'
import {PouchDBAttributePrefix, PouchDBReservedFields} from './PouchDBConstants'

const Bluebird = require('bluebird')
const log = require('typelogger').create(__filename)

let cachedIndexMapPromise = null

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

function updateCachedIndexMap(db) {

	try {
		return db.getIndexes()
			.then(indexesResult => {
				const
					indexes = indexesResult.indexes

				debugger
				return indexes.reduce((map,index,i) => {
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

			}).catch(err => {
				log.error('Failed to update index map', err)

				return Promise.resolve({})

		})
	} catch (err) {
		log.error('index map failed try/catch', err)

		return Promise.resolve({})
	}
}

export function getIndexMap(db,force = false):Promise<TPouchDBIndexMap> {
	log.info('GETTING INDEXES',force)

	return updateCachedIndexMap(db)
	// if (force || !cachedIndexMapPromise) {
	// 	if (cachedIndexMapPromise && force) {
	// 		cachedIndexMapPromise.then(() => {
	// 			return updateCachedIndexMap(db)
	// 		})
	// 	} else if (!cachedIndexMapPromise) {
	// 		cachedIndexMapPromise = updateCachedIndexMap(db)
	// 	}
	// }
	//
	// return cachedIndexMapPromise

}


export function indexFieldsMatch(idx:IPouchDBIndex,fields:string[]) {
	return Array.isEqual(
		cleanFieldPrefixes(filterReservedFields(idx.fields)),
		cleanFieldPrefixes(fields),
		true
	)
}

export function getIndexByNameOrFields(db,indexName:string,fields:string[]) {
	return getIndexMap(db)
		.then(idxMap => {
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

		})


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
function makeMangoIndex(db,indexConfig:PouchDBMangoIndexConfig)
/**
 * Create an index config and then index
 *
 * @param db
 * @param modelName
 * @param indexName
 * @param fields
 */
function makeMangoIndex(db,modelName:string, indexName:string,fields:string[])
function makeMangoIndex(db,indexConfigOrModelName:string|PouchDBMangoIndexConfig, indexName?:string,fields?:string[]) {

	// Make sure we have a valid index config first thing
	const indexConfig = (!indexConfigOrModelName || isString(indexConfigOrModelName)) ?
		makeMangoIndexConfig(<string>indexConfigOrModelName, indexName, fields) :
		indexConfigOrModelName


	indexName = indexConfig.name

	log.info(`Checking index ${indexName}`)

	return getIndexByNameOrFields(db, indexName, fields)
		.then(idx => {
			if (idx && (idx.name !== indexName || indexFieldsMatch(idx, fields))) {
				log.info(`Index def has not changed: ${indexName}`)
				return idx
			} else {

				/**
				 * Local fn to create the index
				 *
				 * @returns {any}
				 */
				const doCreate = () => {
					return db.createIndex({index: indexConfig})
						.then(createResult => {
							log.info(`Create result for ${indexName}`)
							return getIndexMap(db, true)
						})
						.then(updatedIdxMap => {
							return updatedIdxMap[indexName]
						})
				}

				//return doCreate()
				if (idx) {
					log.info(`Index changed, deleting old version: ${indexName}`)
					return db.deleteIndex(idx.def)
						.then(doCreate)
				} else {
					return doCreate()
				}
			}
		})


}

export {
	makeMangoIndex
}