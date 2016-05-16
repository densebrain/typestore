import * as uuid from 'node-uuid'
const FakeIndexedDB:any = require('fake-indexeddb')
const FDBKeyRange:any = require('fake-indexeddb/lib/FDBKeyRange')
import {Coordinator,Repo} from 'typestore'
import * as Fixtures from './fixtures/IndexDBTestModel'
import * as Faker from 'faker'
import {IndexedDBPlugin} from "../IndexedDBPlugin";

const log = getLogger(__filename)

//Setup DynamoDBLocal
let coordinator:Coordinator = null
let store:IndexedDBPlugin = null
const storeOpts = {
	databaseName: 'test3-database-' + uuid.v4(),
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
		await coordinator.start(Fixtures.IDBModel1)
		return true
	})

	it('#open', async () => {
		expect(store.db.tables.length).toBe(1)
		expect(store.db.name).toBe(storeOpts.databaseName)
	})


	it('#puts',async () => {
		const model = new Fixtures.IDBModel1()
		const repo = coordinator.getRepo(Fixtures.IDBRepo1)

		Object.assign(model,{
			id: uuid.v4(),
			createdAt: Faker.date.past(),
			randomText: Faker.lorem.words(10)
		})

		await repo.save(model)
		const key = repo.key(model.id)
		let modelGet = await Promise.resolve(repo.get(key))
		expect(modelGet.id).toBe(model.id)
		expect(modelGet.randomText).toBe(model.randomText)
		expect(await repo.count()).toBe(1)

		await repo.remove(key)
		expect(await repo.count()).toBe(0)

	})

	it('#finder',async () => {
		const model = new Fixtures.IDBModel1()
		const repo = coordinator.getRepo(Fixtures.IDBRepo1)

		Object.assign(model,{
			id: uuid.v4(),
			createdAt: Faker.date.past(),
			randomText: Faker.lorem.words(10)
		})

		await repo.save(model)
		const key = repo.key(model.id)

		const secondWord = model.randomText.split(' ')[2]
		let results = await repo.findByRandomTest(secondWord)
		expect(results.length).toBe(1)

		await repo.remove(key)
		expect(await repo.count()).toBe(0)

	})
})
