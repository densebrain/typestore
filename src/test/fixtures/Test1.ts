import 'reflect-metadata'
import * as Log from '../../log'

import {Repo} from "../../Repo";
import {RepoDescriptor, FinderDescriptor,ModelDescriptor, AttributeDescriptor} from "../../Decorations";
import {DynamoDBFinderDescriptor} from "../../DynamoDBDecorators";

// import {IRepo,IRepoOptions} from "../../Types";
// import {RepoDescriptor, FinderDescriptor} from "../../Decorations";
// import {DefaultRepo} from "../../DefaultRepo";



const log = Log.create(__filename)

@ModelDescriptor({tableName:'testTable1'})
export class Test1 {

	@AttributeDescriptor({name:'id',hashKey:true})
	id:string

	@AttributeDescriptor({name:'createdAt',rangeKey:true})
	createdAt:number


	@AttributeDescriptor({
		name:'randomText',
		index:{
			name: 'RandomTextIndex'
		}
	})
	randomText:string

	constructor() {
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}




@RepoDescriptor()
export class Test1Repo extends Repo<Test1> {

	constructor() {
		super(Test1)
	}

	@DynamoDBFinderDescriptor({
		queryExpression: "randomText contains :randomText",
		// values could be ['randomText'] with the same effect
		values: function(...args) {
			return {
				randomText: args[0]
			}
		}
	})
	@FinderDescriptor()
	findByRandomText(text:string):Test1[] {
		return null
	}
}
