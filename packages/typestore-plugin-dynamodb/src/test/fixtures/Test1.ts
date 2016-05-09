import 'reflect-metadata'
import {Promise,Log,Repo,Decorations,Types} from 'typestore'

import {DynamoDBFinderDescriptor} from "../../DynamoDBDecorations";



const log = Log.create(__filename)

@Decorations.ModelDescriptor({tableName:'testTable1'})
export class Test1 extends Types.DefaultModel {

	@Decorations.AttributeDescriptor({name:'id',hashKey:true})
	id:string

	@Decorations.AttributeDescriptor({name:'createdAt',rangeKey:true})
	createdAt:number


	@Decorations.AttributeDescriptor({
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




@Decorations.RepoDescriptor()
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
	@Decorations.FinderDescriptor()
	findByRandomText(text:string):Promise<Test1[]> {
		return null
	}
}
