import 'reflect-metadata'
import {getLogger} from 'typelogger'
import {ModelDescriptor, AttributeDescriptor} from "../../Decorations";

const log = getLogger(__filename)

@ModelDescriptor({tableName:'testTable_manager1'})
export class ModelTest1 {

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

	constructor() {
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}
