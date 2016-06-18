import * as Faker from 'faker'
import * as uuid from 'node-uuid'
import {Coordinator,Repo,Log} from 'typestore'
import {PouchDBPlugin} from "../PouchDBPlugin";
import * as Fixtures from './fixtures/PouchDBTestModel'




const log = Log.create(__filename)

//Setup DynamoDBLocal
let coordinator:Coordinator = null
let store:PouchDBPlugin = null
const storeOpts = {
	//filename: `/tmp/ts-pouch-${uuid.v4()}`
	filename: `http://127.0.0.1:5984/tstest-${new Date()}`
}

/**
 * Reset TypeStore and start all over
 *
 * @returns {Bluebird<Coordinator>}
 */
async function reset() {
	// Init dynamo type
	// using local
	store = new PouchDBPlugin(storeOpts)

	if (coordinator)
		await coordinator.reset()

	coordinator = new Coordinator()
	await coordinator.init({},store)
	return coordinator
}



describe.only('#plugin-pouchdb',() => {

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
		expect(await repo.count()).toBe(1)

		await repo.remove(key)
		expect(await repo.count()).toBe(0)

	})

	it('#bulkSave',async () => {

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
