//const PouchDB = require('pouchdb')
//PouchDB.debug.enable('pouchdb:find')

import * as Faker from 'faker'
import * as uuid from 'node-uuid'
import {Coordinator,Log} from 'typestore'
import {PouchDBPlugin} from "../PouchDBPlugin";
import * as Fixtures from './fixtures/PouchDBTestModel'
import * as Bluebird from 'bluebird'

Object.assign(global as any,{Promise:Bluebird})

const log = Log.create(__filename)

// Store is configured to reside in the tmp folder
const tmpDir = process.env.TMP || process.env.TMPDIR || '/tmp'
let coordinator:Coordinator = null
let store:PouchDBPlugin = null

const storeOpts = {
	//filename: `test-db.websql.db`,
	//sync: true
	//filename: `http://127.0.0.1:5984/tstest-${new Date()}`
	filename: `/tmp/tstest-${new Date()}`
}


function fakeModel() {
	const model = new Fixtures.PDBModel1()

	Object.assign(model,{
		id: uuid.v4(),
		name: Faker.lorem.words(1),
		createdAt: Faker.date.past(),
		randomText: Faker.lorem.words(10)
	})

	return model
}

/**
 * Reset TypeStore and start all over
 */
async function reset() {
	// Init dynamo type
	// using local
	store = new PouchDBPlugin(storeOpts)

	if (coordinator) {
		await coordinator.reset()
	}
	coordinator = new Coordinator()
	await coordinator.init({},store)
	return coordinator
}


/**
 * Pouchdb test suite - should be abstracted
 * to be a store test suite in general
 */
describe('#plugin-pouchdb',() => {

	before(async () => {
		await reset()
		await coordinator.start(Fixtures.PDBModel1)
		return true
	})

	// it('#open', async () => {
	// 	expect(store.db.name).toBe(storeOpts.filename)
	// })


	it('#puts',async () => {
		const model = new Fixtures.PDBModel1()
		const repo = coordinator.getRepo(Fixtures.PDBRepo1)

		Object.assign(model,{
			id: uuid.v4(),
			createdAt: Faker.date.past(),
			randomText: Faker.lorem.words(10)
		})

		const savedModel = await repo.save(model)
		expect((savedModel as any).$$doc).not.toBe(null)

		const key = repo.key(model.id)
		let modelGet = await repo.get(key)
		expect(modelGet.id).toBe(model.id)
		expect(modelGet.randomText).toBe(model.randomText)

		let currentCount = await repo.count()
		expect(currentCount).toBe(1)

		await repo.remove(key)
		expect(await repo.count()).toBe(0)

	})

	it('#bulkSave+bulkRemove',async () => {

		const repo = coordinator.getRepo(Fixtures.PDBRepo1)

		const models = []
		for (let i = 0; i < 20;i++) {
			const model = new Fixtures.PDBModel1()
			Object.assign(model, {
				id:         uuid.v4(),
				createdAt:  Faker.date.past(),
				randomText: Faker.lorem.words(10)
			})

			models.push(model)
		}

		const savedModels = await repo.bulkSave(...models)
		expect(savedModels.length).toBe(models.length)

		const ids = savedModels.map(savedModel => savedModel.id)
		models.forEach(model => expect(model.$$doc).not.toBeNull())

		await repo.bulkRemove(...ids)

		const finalCount = await repo.count()
		expect(finalCount).toBe(0)
	})

	it('#finder-selector',async () => {
		const
			model = fakeModel(),
			model2 = fakeModel()

		model.name = "name1"
		model2.name = "name2"

		const repo = coordinator.getRepo(Fixtures.PDBRepo1)



		const savedModel = await repo.save(model)
		const savedModel2 = await repo.save(model2)

		const key = repo.key(model.id)
		const key2 = repo.key(model2.id)

		let foundModel = await repo.findByName(model.name)
		expect(foundModel).toBeDefined()


		let foundModels = await repo.findByAnyName(model.name)
		expect(foundModels.length).toBe(1)

		let foundModels2 = await repo.findByAnyName(
			model.name,
			model2.name
		)
		expect(foundModels2.length).toBe(2)


		foundModel = await repo.findByName(model.name + '123')
		expect(foundModel).not.toBeDefined()

		await repo.remove(key)
		await repo.remove(key2)

		expect(await repo.count()).toBe(0)

	})

	it('#finder-fulltext',async () => {
		const model = new Fixtures.PDBModel1()
		const repo = coordinator.getRepo(Fixtures.PDBRepo1)

		Object.assign(model,{
			id: uuid.v4(),
			createdAt: Faker.date.past(),
			randomText: Faker.lorem.words(10)
		})

		const savedModel = await repo.save(model)
		const key = repo.key(model.id)

		const secondWord = model.randomText.split(' ')[2]
		let results = await repo.findByRandomText(secondWord)
		expect(results.length).toBe(1)

		await repo.remove(key)
		expect(await repo.count()).toBe(0)

	})

//
// 	it('#finder-fn',async () => {
//
// 		const repo = coordinator.getRepo(Fixtures.PDBRepo1)
// 		const models = []
// 		const name = 'hello',
// 			name2 = `${name} ${name}`
//
// 		for (let x = 0; x < 10;x++) {
//
// 			const model = new Fixtures.PDBModel1()
//
// 			Object.assign(model,{
// 				id: uuid.v4(),
// 				name,
// 				createdAt: Faker.date.past(),
// 				randomText: Faker.lorem.words(10)
// 			})
//
// 			models.push(model)
// 		}
//
// 		await repo.bulkSave(...models)
//
// 		let results = await repo.findByName(name)
// 		expect(results.length).toBe(models.length)
//
// 		// Testing second batch to make sure not all
// 		const models2 = []
// 		for (let x = 0; x < 20;x++) {
//
// 			const model = new Fixtures.PDBModel1()
//
// 			Object.assign(model,{
// 				id: uuid.v4(),
// 			    name: name2,
// 				createdAt: Faker.date.past(),
// 				randomText: Faker.lorem.words(10)
// 			})
//
// 			models2.push(model)
// 		}
//
// 		await repo.bulkSave(...models2)
//
// 		const results2 = await repo.findByName(name2)
// 		expect(results2.length).toBe(models2.length)
//
// 		// Test name 1 again to confirm
// 		results = await repo.findByName(name)
// 		expect(results.length).toBe(models.length)
//
// 		const keys = models.concat(models2).map(result => repo.key(result.id))
// 		await repo.bulkRemove(...keys)
// 		expect(await repo.count()).toBe(0)
//
// 	})
})
