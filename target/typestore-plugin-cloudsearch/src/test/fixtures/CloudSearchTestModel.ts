const AWS = require('aws-sdk')

import 'reflect-metadata'
import {Promise,Log,Repo,Decorations,Types,DefaultKeyMapper} from 'typestore'

import {CloudSearchProvider} from "../../CloudSearchProvider";
import {CloudSearchLocalEndpoint} from "../../CloudSearchConstants";


const log = Log.create(__filename)

const sharedIniCreds =  new AWS.SharedIniFileCredentials({profile: 'default'})

//const csClient = new AWS.CloudSearch()
// AWS.config.update({region: 'us-east-1',accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// 	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY})



// module.exports = new AWS.CloudSearchDomain({
// 	endpoint: 'doc-test-local-cs-z5wcdkp6wb74brygqixjehebka.us-east-1.cloudsearch.amazonaws.com',
// 	region: 'us-east-1',
//
// })




export const cloudSearchProvider = new CloudSearchProvider(CloudSearchLocalEndpoint, {
	region: 'us-east-1',
	credentials:sharedIniCreds
})

@Decorations.ModelDescriptor({tableName:'testTable1'})
export class CloudSearchTestModel extends Types.DefaultModel {

	@Decorations.AttributeDescriptor({name:'id',hashKey:true})
	id:string

	@Decorations.AttributeDescriptor({})
	date:number


	@Decorations.AttributeDescriptor({})
	text:string

	constructor() {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
	}
}




@Decorations.RepoDescriptor({
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
	@Decorations.FinderDescriptor({
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
