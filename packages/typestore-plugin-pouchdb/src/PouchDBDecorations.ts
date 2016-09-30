import {FinderDescriptor, Repo,Model,IModelOptions,IModel,IFinderOptions} from 'typestore'

import {PouchDBRepoPlugin} from './PouchDBRepoPlugin'

export type PouchDBFinderFn = <M extends IModel>(repo:PouchDBRepoPlugin<M>, ...args:any[]) => Promise<M[]>
export type PouchDBSelectorFn = (...args:any[]) => any
export type PouchDBFilterFn = (doc,...args:any[]) => boolean

export interface IPouchDBFinderOptions extends IFinderOptions {
	limit?:number
	offset?:number
	includeDocs?:boolean
}

export interface IPouchDBFullTextFinderOptions extends IPouchDBFinderOptions {
	textFields:string[]
	queryMapper?:(...args) => string
	minimumMatch?:string
	build?:boolean
}

export interface IPouchDBFnFinderOptions extends IPouchDBFinderOptions {
	fn:PouchDBFinderFn
}

export interface IPouchDBPrefixFinderOptions extends IPouchDBFinderOptions {
	reverse?:boolean
	keyProvider:(...args) => {startKey:string,endKey:string}
}

export interface IPouchDBFilterFinderOptions extends IPouchDBFinderOptions {
	filter:PouchDBFilterFn
}

export interface IPouchDBMangoFinderOptions extends IPouchDBFinderOptions {
	all?:boolean
	selector?:PouchDBSelectorFn|Object
	sort?:string[]
	sortDirection?:'asc'|'desc'
	indexName?:string
	indexDirection?:string
	indexFields?:string[]
}

/**
 * Custom model options for PouchDB
 */
export interface IPouchDBModelOptions extends IModelOptions {
	
	/**
	 * A mapper for creating unique ids,
	 * original key is still returned, this is only accessible on $$doc
	 *
	 * @param o
	 */
	keyMapper?:(o:any) => string
	
	/**
	 * Unwrap a pouch key to external key
	 *
	 * @param key
	 */
	keyUnwrap?:(key:string) => any
	
	/**
	 * Overwrite any conflicts
	 */
	overwriteConflicts?:boolean
}

/**
 * PouchDB specific model decorator
 *
 * @param opts
 * @returns {(constructor:Function)=>undefined}
 */
export function PouchDBModel(opts:IPouchDBModelOptions) {
	return Model(opts)
}

/**
 * Full text search decorator
 *
 * @param opts
 */
export const PouchDBFullTextFinder =
	(opts:IPouchDBFullTextFinderOptions) => FinderDescriptor(opts)


/**
 * Mango finder
 *
 * @param opts
 */
export const PouchDBMangoFinder =
	(opts:IPouchDBMangoFinderOptions) => FinderDescriptor(opts)

/**
 * Prefix finder
 *
 * @param opts
 */
export const PouchDBPrefixFinder =
	(opts:IPouchDBPrefixFinderOptions) => FinderDescriptor(opts)



/**
 * Filter finder
 *
 * @param opts
 */
export const PouchDBFilterFinder =
	(opts:IPouchDBFilterFinderOptions) => FinderDescriptor(opts)

/**
 * Function finder
 *
 * @param opts
 */
export const PouchDBFnFinder =
	(opts:IPouchDBFnFinderOptions) => FinderDescriptor(opts)


