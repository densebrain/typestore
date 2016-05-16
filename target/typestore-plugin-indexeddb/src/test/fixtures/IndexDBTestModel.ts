import 'reflect-metadata'

import {
	Log,
	Repo,
	RepoDescriptor,
	FinderDescriptor,
	ModelDescriptor,
	AttributeDescriptor,
	DefaultModel
} from "typestore"

import {IndexedDBFinderDescriptor} from 'typestore-plugin-indexeddb'

const log = Log.create(__filename)


/**
 * Plain Jane super simple model
 */

@ModelDescriptor({tableName:'idb_model_1'})
export class IDBModel1 extends DefaultModel {

	@AttributeDescriptor({name:'id',primaryKey:true})
	id:string

	@AttributeDescriptor({name:'createdAt'})
	createdAt:number


	@AttributeDescriptor({
		name:'randomText',
		index:{
			name: 'RandomTextIndex'
		}
	})
	randomText:string

	constructor() {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}


@RepoDescriptor()

export class IDBRepo1 extends Repo<IDBModel1> {

	constructor() {
		super(IDBRepo1,IDBModel1)
	}

	@IndexedDBFinderDescriptor({
		filter(o,...args) {
			const txt = o.randomText || ""
			const q = args[0] || ''
			return txt.length > 0 &&
				txt.toLowerCase().indexOf(q.toLowerCase()) > -1
		}
	})
	@FinderDescriptor()
	findByRandomTest(text:string):Promise<IDBModel1[]> {
		return null
	}



}