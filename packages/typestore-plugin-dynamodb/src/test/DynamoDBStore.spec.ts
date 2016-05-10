require('source-map-support').install()

import 'expectations'
import 'reflect-metadata'
import * as uuid from 'node-uuid'
import {Types,Promise,Manager,Constants,Log,SyncStrategy,TypeStoreModelKey,TypeStoreAttrKey} from 'typestore'

if (!process.env.DEBUG)
	Log.setLogThreshold(Log.LogLevel.WARN)

import {IDynamoDBManagerOptions} from "../DynamoDBTypes"
import {DynamoDBStore} from '../DynamoDBStore'


const log = Log.create(__filename)

//Setup DynamoDBLocal
const DynamoDBPort = 8787
const DynamoDBLocal = require('dynamodb-local')
const DynamoDBLocalEndpoint = `http://localhost:${DynamoDBPort}`


let Fixtures = null
let store:DynamoDBStore = null

/**
 * Reset Dynotype and start all over
 *
 * @param syncStrategy
 * @param endpoint
 * @returns {Bluebird<U>}
 */
function reset(syncStrategy:SyncStrategy,endpoint:string) {
	// Init dynamo type
	// using local
	store = new DynamoDBStore()

	const opts:IDynamoDBManagerOptions = {
		dynamoEndpoint: endpoint,
		prefix: `test_${process.env.USER}_`,
		syncStrategy,
		store
	}

	if (!endpoint)
		delete opts['endpoint']

	delete require['./fixtures/index']

	return Manager.reset().then(() => {
			log.info('Manager reset, now init')
		})
		.then(() => Manager.init(opts))
		.then(() => {
			Fixtures = require('./fixtures/index')
		})



}


/**
 * Global test suite
 */
describe('#store-dynamodb',() => {

	before(() => {
		DynamoDBLocal.launch(DynamoDBPort, null, ['-sharedDb'])
	})

	after(() => {
		DynamoDBLocal.stop(DynamoDBPort)
	})

	beforeEach(() => {
		return reset(Types.SyncStrategy.Overwrite,DynamoDBLocalEndpoint)
	})

	/**
	 * Creates a valid table definition
	 */
	it('#tableDef', () => {
		Manager.start(Fixtures.Test1)

		const modelOpts = Manager.getModel(Fixtures.Test1)
		const tableDef = store.tableDefinition(modelOpts.name)


		expect(tableDef.KeySchema.length).toBe(2)
		expect(tableDef.AttributeDefinitions.length).toBe(3)
		expect(tableDef.AttributeDefinitions[0].AttributeName).toBe('id')
		expect(tableDef.AttributeDefinitions[0].AttributeType).toBe('S')
	})

	it("#sync",() => {
		return Manager.start(Fixtures.Test1).then(() => {
			expect(store.availableTables.length).toBeGreaterThan(0)
			expect(Manager.getModel(Fixtures.Test1)).not.toBeNull()
		})
	})

	describe('#repo',() => {
		let t1 = null
		let test1Repo = null
		before(() => {
			t1 = new Fixtures.Test1()
			t1.id = uuid.v4()
			t1.createdAt = new Date().getTime()
			t1.randomText = 'asdfasdfadsf'

			return Manager.start().then(() => {
				test1Repo = Manager.getRepo(Fixtures.Test1Repo)
			})
		})

		it('#create', () => {
			return test1Repo.save(t1)
				.then(() => test1Repo.count())
				.then((rowCount) => {
					expect(rowCount).toBe(1)
				})

		})

		it('#get',() => {
			return test1Repo.get(test1Repo.key(t1.id,t1.createdAt))
				.then((t2) => {
					expect(t1.id).toBe(t2.id)
					expect(t1.createdAt).toBe(t2.createdAt)
					expect(t1.randomText).toBe(t2.randomText)
				})

		})

		it('#finder',() => {
			return test1Repo.findByRandomText('asdfasdfadsf')
				.then((items) => {
					expect(items.length).toBe(1)
					const t2 = items[0]
					expect(t1.id).toBe(t2.id)
					expect(t1.createdAt).toBe(t2.createdAt)
					expect(t1.randomText).toBe(t2.randomText)
				})
		})

		it('#delete',() => {
			return test1Repo.remove(test1Repo.key(t1.id,t1.createdAt))
				.then(() => test1Repo.count())
				.then((rowCount) => {
					expect(rowCount).toBe(0)
				})

		})
	})
})

