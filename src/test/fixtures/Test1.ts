import * as Log from '../../log'
import Decorations = require("../../Decorations")
import {IRepo,IRepoOptions} from "../../Types";
import {RepoDescriptor, FinderDescriptor} from "../../Decorations";
import {DefaultRepo} from "../../DefaultRepo";

const {ModelDescriptor, AttributeDescriptor} = Decorations

const log = Log.create(__filename)

@ModelDescriptor({tableName:'testTable1'})
export class Test1 {

	@AttributeDescriptor({name:'id',partitionKey:true})
	id:string

	@AttributeDescriptor({name:'createdAt',sortKey:true})
	createdAt:number

	@AttributeDescriptor({name:'randomText'})
	randomText:string

	constructor() {
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}


export class Test1Repo extends DefaultRepo<Test1> {



	findByRandomText(text:string):Test1[] {
		return null
	}
}
