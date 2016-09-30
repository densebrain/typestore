
const AWS = require('aws-sdk')

import 'reflect-metadata'
import {
	Repo,
	Log,
	DefaultKeyMapper,
	Model,
	Attribute,
	RepoDescriptor,
	FinderDescriptor,
	DefaultModel
} from 'typestore'

import {CloudSearchFinderDescriptor} from "../../CloudSearchDecorations"
import {CloudSearchProviderPlugin} from "../../CloudSearchProviderPlugin";
import {CloudSearchLocalEndpoint} from "../../CloudSearchConstants";


const log = Log.create(__filename)




@Model({tableName:'testTable1'})
export class CloudSearchTestModel extends DefaultModel {

	@Attribute({name:'id',primaryKey:true})
	id:string

	@Attribute({})
	date:number


	@Attribute({})
	text:string

	constructor() {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}




@RepoDescriptor({
	indexes: [{
		fields: ['id', 'text', 'date']
	}]
})

export class CloudSearchTest1Repo extends Repo<CloudSearchTestModel> {

	constructor() {
		super(CloudSearchTest1Repo,CloudSearchTestModel)
	}

	/**
	 * Create a simple external finder
	 *
	 * @param text
	 * @returns {null}
	 */
	@CloudSearchFinderDescriptor({
		resultType: Object,
		resultKeyMapper: DefaultKeyMapper<Object>('id')
	})
	@FinderDescriptor()
	findByText(text:string):Promise<CloudSearchTestModel[]> {
		return null
	}
}
