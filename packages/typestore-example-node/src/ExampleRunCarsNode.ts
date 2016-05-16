/// <reference path="../typings/typestore-example-node.d.ts"/>
import 'reflect-metadata'
const assert = require('assert')

// - we like bluebird because it makes debugging WAY easier
// - this is totally up to you - but we suggest it ;)
Promise = require('bluebird')

// We dont use the typings here - but you are welcome to
// we are ONLY using it for credential config as you 
// will see
const AWS = require('aws-sdk')

// Make sure you have credentials setup
const awsCredentialChain = new AWS.CredentialProviderChain()
awsCredentialChain.providers.push(new AWS.SharedIniFileCredentials({profile: 'default'}))
awsCredentialChain.providers.push(new AWS.EnvironmentCredentials("AWS"))

// Import all the required core libraries
import {
	Log,
	Coordinator,
	SyncStrategy,
	Repo,
	ModelDescriptor,
	AttributeDescriptor,
	RepoDescriptor,
	FinderDescriptor,
	DefaultKeyMapper,
	DefaultModel
} from 'typestore'

// Import the cloud search specific stuff
import {CloudSearchProviderPlugin,CloudSearchFinderDescriptor,
	CloudSearchLocalEndpoint} from 'typestore-plugin-cloudsearch'
import {DynamoDBStorePlugin,DynamoDBFinderDescriptor,DynamoDBLocalEndpoint} 
	from 'typestore-plugin-dynamodb'







// There is a whole logging framework you are welcome to use
// as well - but it could do with docs - pull request?? ;)
const log = Log.create(__filename)


// Define a model, in this case we extend default model
// but you just have to implement IModel,
// which exposes a single get property clazzName
// so this is simple for convience
// @see https://github.com/densebrain/typestore/blob/master/packages/typestore/src/decorations/ModelDecorations.ts
@ModelDescriptor({tableName:'test_cars'})
class Car extends DefaultModel {

	/**
	 * Empty constructor - simply used to call
	 * the super constructor - empty is fine
	 */
	constructor(props = {}) {
		super()
		log.info(`constructor for ${(this.constructor as any).name}`)
		Object.assign(this,props)
	}

	/**
	 * Each persisted attribute requires
	 * <code>@AttributeDescriptor</code>
	 *
	 * This is the primary key, note the additional
	 * primary key attribute
	 */
	@AttributeDescriptor({name:'manufacturer',primaryKey:true})
	manufacturer:string

	/**
	 * The only additional item here
	 * is the secondary key annotation - this is
	 * NOT really how you would use a secondary
	 * key, but serves as an example
	 */
	@AttributeDescriptor({name:'year',secondaryKey:true})
	year:number

	@AttributeDescriptor({
		name:'model',
		index:{
			name: 'ModelIndex'
		}
	})
	model:string

	/**
	 * tagLine attribute is describing a secondary index
	 */
	@AttributeDescriptor({
		name:'tagLine',
		index:{
			name: 'TagLineIndex'
		}
	})
	tagLine:string

}


// Now we've got a model, we need a repo to service the model
@RepoDescriptor()
class CarRepo extends Repo<Car> {

	/**
	 * Repo is initialized with the final implementing
	 * class and the model class its servicing
	 */
	constructor() {
		super(CarRepo,Car)
	}

	// This decoration must come before @FinderDescriptor
	// simply specifies details and options specifically for
	// Dynamo DB's finder implementation - any store/plugin
	// can still implement this, and have other decorations
	// as well
	@DynamoDBFinderDescriptor({
		queryExpression: "tagLine = :tagLine",
		index: 'TagLineIndex',
		// values could be ['tagLine'] with the same effect
		// values can be Array<string> or Function
		values: function(...args) {
			return {
				':tagLine': args[0]
			}
		}
	})
	// Mark it as a finder
	@FinderDescriptor()
	findByTagLine(text:string):Promise<Car[]> {
		//Empty implementation - it's implemented
		//when the repo is initialized - anything
		//in here is lost
		return null
	}

	@CloudSearchFinderDescriptor({
		resultType: Object,
		resultKeyMapper: DefaultKeyMapper<Object>('id')
	})
	@FinderDescriptor()
	findByTagLineFullText(text:string):Promise<Car[]> {
		return null
	}
}


export async function runCars() {

	
	// Pass in options and the indexer/search
	// will service as a rest array
	const cloudSearchProvider = new CloudSearchProviderPlugin({
		endpoint: CloudSearchLocalEndpoint,
		awsOptions: {
			region: 'us-east-1',
			credentials:awsCredentialChain
		}
	},Car)

	// Pass in options and the models that the store
	// will service as a rest array
	const dynamoStore = new DynamoDBStorePlugin({
		endpoint: DynamoDBLocalEndpoint,
		prefix: `examples_cars_${process.env.USER}_`
	},Car)


	// Create a coordinator
	const coordinator = new Coordinator()
	
	// Initialize it with all plugins
	await coordinator.init({
		syncStrategy: SyncStrategy.Overwrite
	},dynamoStore,cloudSearchProvider)
	
	// Then start it with all models
	await coordinator.start(Car)
	
	let car1 = new Car({
		manufacturer: 'volvo',
		year: 1956,
		model: '740gle',
		tagLine: 'old school'
	})

	const repo1 = coordinator.getRepo(CarRepo)
	car1 = await repo1.save(car1)

	let carCount = await repo1.count()
	assert(carCount === 1, 'only 1 car in there today!')

	const car1Key = repo1.key(car1.manufacturer,car1.year)
	const car1FromRepo = await repo1.get(car1Key)

	assert(car1FromRepo.manufacturer === car1.manufacturer &&
		car1FromRepo.year === car1.year &&
			car1FromRepo.model === car1.model
		,`These should be identical\n${JSON.stringify(car1,null,4)} 
			from repo \n${JSON.stringify(car1FromRepo,null,4)}`)

	await repo1.remove(car1Key)
	carCount = await repo1.count()
	assert(carCount === 0, 'only 1 car in there today!')
	
	return true
}

// Execute with runCars() or check spec