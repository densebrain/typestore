import 'reflect-metadata'

import {
	Log,
	Repo,
	RepoDescriptor,
	FinderDescriptor,
	Model,
	Attribute,
	DefaultModel,
	FinderRequest,
	FinderResultArray
} from "typestore"

import {
	PouchDBFilterFinder,
	PouchDBPrefixFinder,
	PouchDBModel,
	PouchDBMangoFinder,
	PouchDBFullTextFinder
} from '../../index'


const log = Log.create(__filename)


@PouchDBModel({
	tableName:'idb_model_2',
	overwriteConflicts: true
})
export class PDBModel2 extends DefaultModel {

	@Attribute({name:'id',primaryKey:true})
	id:string

	@Attribute({name:'createdAt'})
	createdAt:number


	@Attribute({
		name:'randomText',
		index:{
			name: 'randomText'
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
export class PDBRepo2 extends Repo<PDBModel2> {

	constructor() {
		super(PDBRepo2,PDBModel2)
	}

}

/**
 * Plain Jane super simple model
 */

@PouchDBModel({
	tableName:'idb_model_1',
	overwriteConflicts: false
})
export class PDBModel1 extends DefaultModel {

	@Attribute({name:'id',primaryKey:true})
	id:string

	@Attribute({name:'createdAt'})
	createdAt:number


	@Attribute(
		{
		name:'randomText',
		index:{
			name: 'randomText'
		}
	}
	)
	randomText:string

	@Attribute()
	name:string

	constructor() {
		super()
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
	
	@PouchDBMangoFinder({
		selector: (...names) => ({
			$or: names.map(name => ({
				name: {$eq: name}
			}))
		}),
		indexFields: ['name']
	})
	findByAnyNameWithRequest(request:FinderRequest,...names:string[]):Promise<PDBModel1[]> {
		return null
	}
	
	@PouchDBPrefixFinder({
		keyProvider: (prefix) => {
			const
				startKey = prefix
			
			return {
				startKey,
				endKey: `${startKey}\uffff`
			}
		}
	})
	findByPrefix(request:FinderRequest,name:string):Promise<FinderResultArray<PDBModel1>> {
		return null
	}

}





/**
 * Used for prefix and bulk test
 */


@Model({tableName:'idb_model_3'})
export class PDBModel3 extends DefaultModel {
	
	static makeId(...groups:string[]) {
		return groups.join('-')
	}
	
	@Attribute({name:'id',primaryKey:true})
	id:string
	
	@Attribute()
	group1:string
	
	@Attribute()
	group2:string
	
	@Attribute()
	group3:string
	
	
	@Attribute()
	name:string
}

@RepoDescriptor()
export class PDBRepo3 extends Repo<PDBModel3> {
	
	constructor() {
		super(PDBRepo3,PDBModel3)
	}
	
	
	@PouchDBPrefixFinder({
		keyProvider: (...groups) => {
			const
				startKey = PDBModel3.makeId(...groups)
			
			return {
				startKey,
				endKey: `${startKey}\uffff`
			}
		}
	})
	findByGroups(...groups:string[]):Promise<PDBModel3[]> {
		return null
	}
	
	
	
}




/**
 * Used for prefix and bulk test
 */

export function makeModel4Id(id,second) {
	return `${id}/${second}`
}

@PouchDBModel({
	tableName:'idb_model_4',
	keyMapper: (o) => makeModel4Id(o.id,o.second)
})
export class PDBModel4 extends DefaultModel {
	
	static makeId = makeModel4Id
	
	@Attribute({name:'id',primaryKey:true})
	id:string
	
	@Attribute()
	second:string
	
	@Attribute()
	name:string
}

@RepoDescriptor()
export class PDBRepo4 extends Repo<PDBModel4> {
	
	constructor() {
		super(PDBRepo4,PDBModel4)
	}
	
	@PouchDBPrefixFinder({
		includeDocs: false,
		keyProvider: (...parts) => {
			const
				startKey = parts.join('/')
			
			log.info(`Using start key ${startKey}`)
			
			return {
				startKey,
				endKey: `${startKey}\uffff`
			}
		}
	})
	findIdsByMappedKey(...parts:string[]):Promise<string[]> {
		return null
	}
	
}