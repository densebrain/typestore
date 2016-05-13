const log = getLogger(__filename)

import * as uuid from 'node-uuid'
import {Coordinator,SyncStrategy} from 'typestore'
import {IDynamoDBCoordinatorOptions} from "../DynamoDBTypes"
import {DynamoDBStore} from '../DynamoDBStore'
import * as Fixtures from './fixtures/index'

//Setup DynamoDBLocal
const DynamoDBPort = 8787
const DynamoDBLocal = require('dynamodb-local')
const DynamoDBLocalEndpoint = `http://localhost:${DynamoDBPort}`

let store:DynamoDBStore = null

/**
 * Reset TypeStore and start all over
 *
 * @param syncStrategy
 * @param endpoint
 * @returns {Bluebird<Coordinator>}
 */
async function reset(syncStrategy:SyncStrategy,endpoint:string) {
	// Init dynamo type
	// using local
	store = new DynamoDBStore()

	const opts:IDynamoDBCoordinatorOptions = {
		dynamoEndpoint: endpoint,
		prefix: `test_${process.env.USER}_`,
		syncStrategy
	}

	if (!endpoint)
		delete opts['endpoint']



	await Coordinator.reset()
	await Coordinator.init(opts,store)
	return Coordinator
}


/**
 * Global test suite
 */
describe('#plugin-dynamodb', function() {
	this.timeout(60000)

	before(() => {
		return DynamoDBLocal.launch(DynamoDBPort, null, ['-sharedDb'])
	})

	after(() => {
		DynamoDBLocal.stop(DynamoDBPort)
	})

	beforeEach(() => {
		return reset(SyncStrategy.Overwrite,DynamoDBLocalEndpoint)
	})

	/**
	 * Creates a valid table definition
	 */
	it('#tableDef', () => {
		Coordinator.start(Fixtures.Test1)

		const modelOpts = Coordinator.getModel(Fixtures.Test1)
		const tableDef = store.tableDefinition(modelOpts.name)

		expect(tableDef.KeySchema.length).toBe(2)
		expect(tableDef.AttributeDefinitions.length).toBe(3)
		expect(tableDef.AttributeDefinitions[0].AttributeName).toBe('id')
		expect(tableDef.AttributeDefinitions[0].AttributeType).toBe('S')
	})

	it("#sync", async () => {
		await Coordinator.start(Fixtures.Test1)

		expect(store.availableTables.length).toBeGreaterThan(0)
		expect(Coordinator.getModel(Fixtures.Test1)).not.toBeNull()
	})

	describe('#repo',() => {
		let t1 = null
		let test1Repo = null
		before(async () => {
			t1 = new Fixtures.Test1()
			t1.id = uuid.v4()
			t1.createdAt = new Date().getTime()
			t1.randomText = 'asdfasdfadsf'

			await Coordinator.start(Fixtures.Test1)
			test1Repo = Coordinator.getRepo(Fixtures.Test1Repo)
		})

		it('#create', async () => {
			await test1Repo.save(t1)
			let rowCount = await test1Repo.count()
			expect(rowCount).toBe(1)
		})

		it('#get', async () => {
			let t2 = await test1Repo.get(test1Repo.key(t1.id,t1.createdAt))

			expect(t1.id).toBe(t2.id)
			expect(t1.createdAt).toBe(t2.createdAt)
			expect(t1.randomText).toBe(t2.randomText)
		})

		it('#finder', async () => {
			let items = await test1Repo.findByRandomText('asdfasdfadsf')

			expect(items.length).toBe(1)
			const t2 = items[0]
			expect(t1.id).toBe(t2.id)
			expect(t1.createdAt).toBe(t2.createdAt)
			expect(t1.randomText).toBe(t2.randomText)

		})

		it('#delete', async () => {
			await test1Repo.remove(test1Repo.key(t1.id,t1.createdAt))
			let rowCount = await test1Repo.count()
			expect(rowCount).toBe(0)
		})
	})
})

