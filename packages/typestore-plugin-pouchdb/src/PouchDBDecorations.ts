import {makeOptionsDecorator,FinderDescriptor, Repo,IModel,IFinderOptions} from 'typestore'
import {
	PouchDBMangoFinderKey,
	PouchDBFilterFinderKey,
	PouchDBFnFinderKey
} from "./PouchDBConstants"

import {PouchDBRepoPlugin} from './PouchDBRepoPlugin'

export type PouchDBFinderFn = <M extends IModel>(repo:PouchDBRepoPlugin<M>, ...args:any[]) => Promise<M[]>
export type PouchDBSelectorFn = (...args:any[]) => any
export type PouchDBFilterFn = (doc,...args:any[]) => boolean

export interface IPouchDBFinderOptions extends IFinderOptions {
	limit?:number
	offset?:number
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

export interface IPouchDBFilterFinderOptions extends IPouchDBFinderOptions {
	filter:PouchDBFilterFn
}

export interface IPouchDBMangoFinderOptions extends IPouchDBFinderOptions {
	selector:PouchDBSelectorFn|Object
	sort?:any
	indexName?:string
	indexFields?:string[]
}

export const PouchDBFullTextFinder =
	(opts:IPouchDBFullTextFinderOptions) => FinderDescriptor(opts)

export const PouchDBMangoFinder =
	(opts:IPouchDBMangoFinderOptions) => FinderDescriptor(opts)

export const PouchDBFilterFinder =
	(opts:IPouchDBFilterFinderOptions) => FinderDescriptor(opts)

export const PouchDBFnFinder =
	(opts:IPouchDBFnFinderOptions) => FinderDescriptor(opts)

//makeOptionsDecorator<IPouchDBMangoFinderOptions>(PouchDBMangoFinderKey)
