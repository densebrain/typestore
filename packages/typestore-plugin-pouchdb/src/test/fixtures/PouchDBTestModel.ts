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

import {PouchDBFilterFinder,PouchDBMangoFinder,PouchDBFullTextFinder} from 'typestore-plugin-pouchdb'


const log = Log.create(__filename)


/**
 * Plain Jane super simple model
 */

@ModelDescriptor({tableName:'idb_model_1'})
export class PDBModel1 extends DefaultModel {

	@AttributeDescriptor({name:'id',primaryKey:true})
	id:string

	@AttributeDescriptor({name:'createdAt'})
	createdAt:number


	@AttributeDescriptor(
		{
		name:'randomText',
		index:{
			name: 'randomText'
		}
	}
	)
	randomText:string

	@AttributeDescriptor()
	name:string

	constructor() {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}


@RepoDescriptor()
export class PDBRepo1 extends Repo<PDBModel1> {

	constructor() {
		super(PDBRepo1,PDBModel1)
	}

	// @PouchDBFilterFinder({
	// 	filter: (doc,text) => new RegExp(text,'i')
	// 		.test(doc.randomText)
	// })
	@PouchDBFullTextFinder({
		textFields: ['randomText']
	})
	findByRandomText(text:string):Promise<PDBModel1[]> {
		return null
	}

	@PouchDBMangoFinder({
		single: true,
		selector: (...args) => ({
			name: args[0]
		}),
		indexFields: ['name']

		// selector: (...args:any[]) => ({
		// 	// `(?i)${args[0]}`
		// 	randomText: {$regex: `${args[0]}`}
		// })
		// fn(repo,text) {
		// 	return repo.all().then(result => {
		// 		const textFilter = new RegExp(text,'i')
		// 		return result.docs.filter(doc => textFilter.test(doc.attrs.randomText))
		// 	})
		// }
	})
	findByName(name:string):Promise<PDBModel1> {
		return null
	}





}