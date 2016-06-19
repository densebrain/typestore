import {makeOptionsDecorator, IModel} from 'typestore'
import {PouchDBFinderKey} from "./PouchDBConstants";
import {PouchDBRepoPlugin} from './PouchDBRepoPlugin'

export type PouchDBFinderFn = <M extends IModel>(repo:PouchDBRepoPlugin<M>, ...args:any[]) => Promise<M[]>
export type PouchDBSelectorFn = (...args:any[]) => any
export type PouchDBFilterFn = (doc,...args:any[]) => boolean
export interface IPouchDBFinderOptions {
	fn?:PouchDBFinderFn
	selector?:PouchDBSelectorFn
	filter?:PouchDBFilterFn
	sort?:any
	limit?:number
	singleResult?:boolean
}

export const PouchDBFinderDescriptor =
	makeOptionsDecorator<IPouchDBFinderOptions>(PouchDBFinderKey)
