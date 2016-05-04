import * as Log from '../../log'
import {ModelDescriptor, AttributeDescriptor} from "../../ModelDecorations";

const log = Log.create(__filename)

@ModelDescriptor({tableName:'testTable1'})
export class Test1 {

	@AttributeDescriptor({name:'id',partitionKey:true})
	id:string

	@AttributeDescriptor({name:'createdAt',sortKey:true})
	createdAt:number

	@AttributeDescriptor({name:'field2'})
	attrStr2:string

	constructor() {
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}
