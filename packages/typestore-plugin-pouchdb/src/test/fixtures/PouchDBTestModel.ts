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


@ModelDescriptor({tableName:'idb_model_2'})
export class PDBModel2 extends DefaultModel {

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
export class PDBRepo2 extends Repo<PDBModel2> {

	constructor() {
		super(PDBRepo2,PDBModel2)
	}

}

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
	})
	findByName(name:string):Promise<PDBModel1> {
		return null
	}

	@PouchDBMangoFinder({
		selector: (...names) => ({
			$or: names.map(name => ({
				name: {$eq: name}
			}))
			//name: { $in: names }
		}),
		indexFields: ['name']
	})
	findByAnyName(...names:string[]):Promise<PDBModel1[]> {
		return null
	}





}