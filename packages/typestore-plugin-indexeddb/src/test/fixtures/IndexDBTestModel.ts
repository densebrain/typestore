import 'reflect-metadata'

import {
	Log,
	Repo,
	RepoDescriptor,
	FinderDescriptor,
	Model,
	Attribute,
	DefaultModel
} from "typestore"

import {IndexedDBFinderDescriptor} from '../../index'

const log = Log.create(__filename)


/**
 * Plain Jane super simple model
 */

@Model({tableName:'idb_model_1'})
export class IDBModel1 extends DefaultModel {

	@Attribute({name:'id',primaryKey:true})
	id:string

	@Attribute({name:'createdAt'})
	createdAt:number


	@Attribute({
		name:'randomText',
		index:{
			name: 'RandomTextIndex'
		}
	})
	randomText:string

	@Attribute()
	name:string
	
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

	@IndexedDBFinderDescriptor({
		async fn(repo,...args) {
			const {table,mapper,db} = repo
			const jsons = await table.where('name').equalsIgnoreCase(args[0]).toArray()
			return jsons.map(json => mapper.fromObject(json))
		}
	})
	@FinderDescriptor()
	findByName(name:string):Promise<IDBModel1[]> {
		return null
	}



}