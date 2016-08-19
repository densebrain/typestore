import {makeOptionsDecorator, IModel,MetadataPropertyDecoratorFactory} from 'typestore'
import {IndexedDBFinderKey} from "./IndexedDBConstants";
import {IndexedDBRepoPlugin} from './IndexedDBRepoPlugin'

export type IndexedDBFinderFn = <M extends IModel>(repo:IndexedDBRepoPlugin<M>, ...args:any[]) => Promise<M[]>

export interface IIndexedDBFinderOptions {
	fn?:IndexedDBFinderFn
	singleResult?:boolean
	filter?: (o:any,...args:any[]) => boolean
}

export const IndexedDBFinderDescriptor =
	makeOptionsDecorator<IIndexedDBFinderOptions>(IndexedDBFinderKey)
