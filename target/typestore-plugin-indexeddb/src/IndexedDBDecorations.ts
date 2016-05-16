import {makeOptionsDecorator} from 'typestore'
import {IndexedDBFinderKey} from "./IndexedDBConstants";


export interface IIndexedDBFinderOptions {
	filter: (o:any,...args:any[]) => boolean
}

export const IndexedDBFinderDescriptor = 
	makeOptionsDecorator<IIndexedDBFinderOptions>(IndexedDBFinderKey)
