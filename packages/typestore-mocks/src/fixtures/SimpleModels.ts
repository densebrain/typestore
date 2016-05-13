import 'reflect-metadata'

import {
	Log,
	Repo,
	RepoDescriptor,
	FinderDescriptor,
	ModelDescriptor,
	AttributeDescriptor,
	DefaultModel
} from "typestore"


const log = Log.create(__filename)


/**
 * Plain Jane super simple model
 */

@ModelDescriptor({tableName:'simple_model_1'})
export class SimpleModel1 extends DefaultModel {

	@AttributeDescriptor({name:'id',primaryKey:true})
	id:string

	@AttributeDescriptor({name:'createdAt'})
	createdAt:number


	@AttributeDescriptor({
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

	/**
	 * Create a simple external finder
	 *
	 * @param text
	 * @returns {null}
	 */
	// @FinderDescriptor()
	// @IndexedDBFinder()
	// findByText(text:string):Promise<SimpleModel1[]> {
	// 	return null
	// }
}