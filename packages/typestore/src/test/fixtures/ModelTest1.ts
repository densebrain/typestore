import 'reflect-metadata'
import {getLogger} from 'typelogger'
import {Model, Attribute} from "../../Decorations";

const log = getLogger(__filename)

@Model({tableName:'testTable_manager1'})
export class ModelTest1 {

	@Attribute({name:'id',primaryKey:true})
	id:string

	@Attribute({name:'createdAt',secondaryKey:true})
	createdAt:number


	@Attribute({
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
