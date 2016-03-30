import 'reflect-metadata'
import * as Log from '../../log'

import {Repo} from "../../Repo";
import {RepoDescriptor, FinderDescriptor,ModelDescriptor, AttributeDescriptor} from "../../Decorations";


const log = Log.create(__filename)

@ModelDescriptor({tableName:'testTable1'})
export class ModelTest1 {

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
