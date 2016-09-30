import 'reflect-metadata'

import {
	Log,
	Repo,
	RepoDescriptor,
	FinderDescriptor,
	Model,
	Attribute,
	DefaultModel
} from "typestore"


const log = Log.create(__filename)


/**
 * Plain Jane super simple model
 */

@Model({tableName:'simple_model_1'})
export class SimpleModel1 extends DefaultModel {

	@Attribute({name:'id',primaryKey:true})
	id:string

	@Attribute({name:'createdAt'})
	createdAt:number


	@Attribute({
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


@RepoDescriptor()

export class SimpleModel1Repo extends Repo<SimpleModel1> {

	constructor() {
		super(SimpleModel1Repo,SimpleModel1)
	}

	
}