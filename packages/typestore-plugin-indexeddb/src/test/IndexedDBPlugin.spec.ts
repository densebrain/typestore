import * as uuid from 'node-uuid'
const FakeIndexedDB:any = require('fake-indexeddb')
const FDBKeyRange:any = require('fake-indexeddb/lib/FDBKeyRange')
import {Coordinator,Repo} from 'typestore'
import {Fixtures} from 'typestore-mocks'
import * as Faker from 'faker'
import {IndexedDBPlugin} from "../IndexedDBPlugin";

const log = getLogger(__filename)

//Setup DynamoDBLocal
let coordinator:Coordinator = null
let store:IndexedDBPlugin = null
const storeOpts = {
	databaseName: 'test-database',
	provider: {
		indexedDB: FakeIndexedDB,
		IDBKeyRange: FDBKeyRange
	}
}
/**
 * Reset TypeStore and start all over
 *
 * @returns {Bluebird<Coordinator>}
 */
async function reset() {
	// Init dynamo type
	// using local
	store = new IndexedDBPlugin(storeOpts)

	if (coordinator)
		await coordinator.reset()

	coordinator = new Coordinator()
	await coordinator.init({},store)
	return coordinator
}



describe('#plugin-indexeddb',() => {

	before(async () => {
		await reset()
		return true
	})

	it('#open', async () => {

		await coordinator.start(Fixtures.SimpleModel1)
		
		expect(store.db.tables.length).toBe(1)
		expect(store.db.name).toBe(storeOpts.databaseName)

	})

	it('#puts',async () => {
		const model = new Fixtures.SimpleModel1()
		const repo:Fixtures.SimpleModel1Repo = coordinator.getRepo(Fixtures.SimpleModel1Repo)

		Object.assign(model,{
			id: uuid.v4(),
			createdAt: Faker.date.past(),
			randomText: Faker.lorem.words(10)
		})

		await repo.save(model)
		let modelGet = await Promise.resolve(repo.get(repo.key(model.id)))
		expect(modelGet.id).toBe(model.id)
		expect(modelGet.randomText).toBe(model.randomText)

	})
})
