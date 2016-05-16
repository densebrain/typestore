import 'reflect-metadata'
import {
	Log,
	Repo,
	ModelDescriptor,
	AttributeDescriptor,
	RepoDescriptor,
	FinderDescriptor,
	DefaultModel
} from 'typestore'

import {DynamoDBFinderDescriptor} from "../../DynamoDBDecorations";



const log = Log.create(__filename)

@ModelDescriptor({tableName:'testDynamoTable1'})
export class Test1 extends DefaultModel {

	
	constructor() {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
	}

	@AttributeDescriptor({name:'id',primaryKey:true})
	id:string

	@AttributeDescriptor({name:'createdAt',secondaryKey:true})
	createdAt:number


	@AttributeDescriptor({
		name:'randomText',
		index:{
			name: 'RandomTextIndex'
		}
	})
	randomText:string

}




@RepoDescriptor()
export class Test1Repo extends Repo<Test1> {

	constructor() {
		super(Test1Repo,Test1)
	}

	@DynamoDBFinderDescriptor({
		queryExpression: "randomText = :randomText",
		index: 'RandomTextIndex',
		// values could be ['randomText'] with the same effect
		values: function(...args) {
			return {
				':randomText': args[0]
			}
		}
	})
	@FinderDescriptor()
	findByRandomText(text:string):Promise<Test1[]> {
		return null
	}
}
