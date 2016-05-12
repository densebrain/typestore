const AWS = require('aws-sdk')

import 'reflect-metadata'
import {
	Promise,
	Repo,
	Log,
	Types,
	DefaultKeyMapper,
	ModelDescriptor,
	AttributeDescriptor,
	RepoDescriptor,
	FinderDescriptor
} from 'typestore'


import {CloudSearchProvider} from "../../CloudSearchProvider";
import {CloudSearchLocalEndpoint} from "../../CloudSearchConstants";


const log = Log.create(__filename)

const sharedIniCreds =  new AWS.SharedIniFileCredentials({profile: 'default'})

export const cloudSearchProvider = new CloudSearchProvider({
	endpoint: CloudSearchLocalEndpoint,
	awsOptions: {
		region: 'us-east-1',
		credentials:sharedIniCreds
	}
})


@ModelDescriptor({tableName:'testTable1'})
export class CloudSearchTestModel extends Types.DefaultModel {

	@AttributeDescriptor({name:'id',hashKey:true})
	id:string

	@AttributeDescriptor({})
	date:number


	@AttributeDescriptor({})
	text:string

	constructor() {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}




@RepoDescriptor({
	indexers: [{
		indexer: cloudSearchProvider,
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
	@FinderDescriptor({
		searchOptions: {
			resultType: Object,
			resultKeyMapper: DefaultKeyMapper<Object>('id'),
			provider: cloudSearchProvider
		}
	})
	findByText(text:string):Promise<CloudSearchTestModel[]> {
		return null
	}
}
