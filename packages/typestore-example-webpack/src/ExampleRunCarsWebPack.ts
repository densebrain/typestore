import 'reflect-metadata'
const assert = require('assert')

// - we like bluebird because it makes debugging WAY easier
// - this is totally up to you - but we suggest it ;)
Promise = require('bluebird')

import Dexie from 'dexie'

// Import all the required core libraries
import {
	Log,
	Coordinator,
	SyncStrategy,
	Repo,
	ModelDescriptor,
	AttributeDescriptor,
	RepoDescriptor,
	DefaultModel
} from 'typestore'

// Import the cloud search specific stuff
import {IndexedDBPlugin} from 'typestore-plugin-indexeddb'

// There is a whole logging framework you are welcome to use
// as well - but it could do with docs - pull request?? ;)
const log = Log.create(__filename)


function logToBody(...args) {
	document.getElementById('body').innerHTML += `<br/>${args.join(' ')}`
	console.log.apply(console,args)
}



Log.setLoggerOutput(logToBody as any)

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
	@AttributeDescriptor({name:'year'})
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


}


export async function runCars() {

	const idbOpts = {
		databaseName: 'cars-db'
	}

	const dbToDelete = new Dexie(idbOpts.databaseName)
	await dbToDelete.delete()
	const idbStore = new IndexedDBPlugin(idbOpts, Car)



	// Create a coordinator
	const coordinator = new Coordinator()

	// Initialize it with all plugins
	await coordinator.init({
		syncStrategy: SyncStrategy.Overwrite
	},idbStore)

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
	log.info('Car saved')

	let carCount = await repo1.count()
	assert(carCount === 1, 'only 1 car in there today!')
	log.info('Car count = 1')

	const car1Key = repo1.key(car1.manufacturer)
	const car1FromRepo = await repo1.get(car1Key)

	assert(car1FromRepo.manufacturer === car1.manufacturer &&
		car1FromRepo.year === car1.year &&
			car1FromRepo.model === car1.model
		,`These should be identical\n${JSON.stringify(car1,null,4)} 
			from repo \n${JSON.stringify(car1FromRepo,null,4)}`)
	log.info('Car models match')

	await repo1.remove(car1Key)
	log.info('Car removed')

	carCount = await repo1.count()
	assert(carCount === 0, 'only 1 car in there today!')
	log.info('Car count 0')

	log.info('All tests run')
	return true
}

// Execute with runCars() or check spec