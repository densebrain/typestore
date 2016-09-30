const PouchDB = require('pouchdb')
//PouchDB.debug.enable('pouchdb:*')
//PouchDB.debug.enable('*');

import * as Faker from 'faker'
import * as uuid from 'node-uuid'
import { Coordinator, Log } from 'typestore'
import { PouchDBPlugin } from "../PouchDBPlugin";
import * as Fixtures from './fixtures/PouchDBTestModel'
import { IPouchDBOptions } from "../PouchDBPlugin"
import {FinderRequest} from 'typestore'


// Store is configured to reside in the tmp folder
const
	log = Log.create(__filename),
	tmpDir = process.env.TMP || process.env.TMPDIR || '/tmp'


let
	coordinator:Coordinator = null,
	store:PouchDBPlugin


function fakeModel() {
	const model = new Fixtures.PDBModel1()
	
	Object.assign(model, {
		id: uuid.v4(),
		name: Faker.lorem.words(1),
		createdAt: Faker.date.past(),
		randomText: Faker.lorem.words(10)
	})
	
	return model
}

async function stop() {
	if (coordinator) {
		log.info(`Stopping coordinator`)
		await coordinator.reset()
	}
	
	coordinator = null
}


/**
 * Reset TypeStore and start all over
 */
async function reset(useGlobal = true, extraOpts = null,...models) {
	
	await stop()
	
	const
		storeOpts:IPouchDBOptions = Object.assign({
			//filename: `test-db.websql.db`,
			//sync: true
			//filename: `http://127.0.0.1:5984/tstest-${new Date()}`
			filename: `/tmp/tstest-${Date.now()}`,
			databasePerRepo: !useGlobal
		},extraOpts || {})
	
	//if (!useGlobal)
	//mkdirp(storeOpts.filename)
	
	log.info(`Create store - global = ${useGlobal}`)
	store = new PouchDBPlugin(storeOpts)
	
	coordinator = new Coordinator()
	log.info(`Init coordinator`)
	await coordinator.init({}, store)
	
	log.info(`Start coordinator`)
	await coordinator.start(...models)
	return coordinator
}


/**
 * Pouch test suite - should be abstracted
 * to be a store test suite in general
 */
describe('#plugin-pouchdb', () => {
	
	describe(`#conflict-overwrite-test`, async () => {
		before(async() => {
			await reset(
				false,
				null,
				Fixtures.PDBModel1,
				Fixtures.PDBModel2
			)
			return true
		})
		
		after(async() => {
			await stop()
		})
		
		it('#conflict-overwrite',async () => {
			
			let
				err:Error = null
			
			const
				doTest = async (modelClazz,repoClazz) => {
					try {
						let
							model = new modelClazz(),
							repo = coordinator.getRepo(repoClazz)
						
						Object.assign(model, {
							id: uuid.v4(),
							createdAt: Faker.date.past(),
							randomText: Faker.lorem.words(10)
						})
						
						model = await repo.save(model)
						
						const
							model2 = Object.assign(new modelClazz(),model, {
								randomText: Faker.lorem.words(10),
								$$doc: Object.assign({},(model as any).$$doc,{
									_rev: '1-aa86c0e405a07fb76ef3e523dd1c2ae1'
								}),
							})
						
						await repo.save(model2)
						
						return null
					} catch (anErr) {
						return anErr
						
					}
				}
				
			err = await doTest(Fixtures.PDBModel1,Fixtures.PDBRepo1)
			expect(err && (err as any).status).toBe(409)
			
			err = await doTest(Fixtures.PDBModel2,Fixtures.PDBRepo2)
			expect(err).toBeNull()
			
		})
		
		it('#conflict-overwrite-bulk',async () => {
			
			let
				err:Error = null
			
			const
				doTest = async (modelClazz,repoClazz) => {
					try {
						const makeModel = () =>
							Object.assign(new modelClazz(), {
								id: uuid.v4(),
								createdAt: Faker.date.past(),
								randomText: Faker.lorem.words(10)
							})
						
						let
							models = [makeModel(),makeModel()],
							repo = coordinator.getRepo(repoClazz)
						
						
						const
							models1 = await repo.bulkSave(...models)
						
						const
							models2 = [
								Object.assign(new modelClazz(),models1[0], {
									randomText: Faker.lorem.words(10),
									$$doc: Object.assign({},(models1[0] as any).$$doc,{
										_rev: '1-aa86c0e405a07fb76ef3e523dd1c2ae1'
									}),
								}),
								models1[1]
							]
								
						
						await repo.bulkSave(...models2)
						
						return null
					} catch (anErr) {
						return anErr
						
					}
				}
			
			err = await doTest(Fixtures.PDBModel1,Fixtures.PDBRepo1)
			expect(err && (err as any).status).toBe(409)
			
			err = await doTest(Fixtures.PDBModel2,Fixtures.PDBRepo2)
			expect(err).toBeNull()
			
		})
		
	})
	
	// REGULAR TESTS
	for (let useGlobal of [ true, false ]) {
		describe(`#global-repo-${useGlobal}`, function () {
			
			this.timeout(120 * 60000)
			
			before(async() => {
				await reset(
					useGlobal,
					null,
					Fixtures.PDBModel1,
					Fixtures.PDBModel2,
					Fixtures.PDBModel3,
					Fixtures.PDBModel4
				)
				return true
			})
			
			after(async() => {
				await stop()
			})
			
			it('#puts', async() => {
				const
					model = new Fixtures.PDBModel1(),
					repo = coordinator.getRepo(Fixtures.PDBRepo1)
				
				Object.assign(model, {
					id: uuid.v4(),
					createdAt: Faker.date.past(),
					randomText: Faker.lorem.words(10)
				})
				
				const
					savedModel = await repo.save(model),
					key = repo.key(model.id)
				
				// Check we got a doc value
				expect((savedModel as any).$$doc).not.toBe(null)
				
				let
					modelGet = await repo.get(key)
				
				expect(modelGet.id).toBe(model.id)
				expect(modelGet.randomText).toBe(model.randomText)
				
				let currentCount = await repo.count()
				expect(currentCount).toBe(1)
				
				await repo.remove(key)
				expect(await repo.count()).toBe(0)
				
			})
			
			it('#bulkSave+bulkRemove', async() => {
				
				const repo = coordinator.getRepo(Fixtures.PDBRepo1)
				
				const models = []
				for (let i = 0; i < 1000; i++) {
					const model = new Fixtures.PDBModel1()
					Object.assign(model, {
						id: uuid.v4(),
						createdAt: Faker.date.past(),
						randomText: Faker.lorem.words(10)
					})
					
					models.push(model)
				}
				
				const savedModels = await repo.bulkSave(...models)
				expect(savedModels.length).toBe(models.length)
				//const nextCount = await repo.count()
				//expect(nextCount).toBe(models.length)
				
				const ids = savedModels.map(savedModel => savedModel.id)
				models.forEach(model => expect(model.$$doc).not.toBeNull())
				
				await repo.bulkRemove(...ids)
				
				const finalCount = await repo.count()
				expect(finalCount).toBe(0)
			})
			
			it('#finder-selector', async() => {
				const
					model = fakeModel(),
					model2 = fakeModel()
				
				model.name = "name1"
				model2.name = "name2"
				
				const
					repo = coordinator.getRepo(Fixtures.PDBRepo1),
					savedModel = await repo.save(model),
					savedModel2 = await repo.save(model2),
				
					key = repo.key(model.id),
					key2 = repo.key(model2.id)
				
				let
					foundModel = await repo.findByName(model.name)
				
				
				expect(foundModel).toBeDefined()
				
				let
					foundModels = await repo.findByAnyName(model.name)
				
				expect(foundModels.length).toBe(1)
				
				let
					foundModels2 = await repo.findByAnyName(
						model.name,
						model2.name
					)
				
				expect(foundModels2.length).toBe(2)
				
				
				foundModel = await repo.findByName(model.name + '123')
				
				expect(foundModel).not.toBeDefined()
				
				await Promise.all([repo.remove(key),repo.remove(key2)])
				
				expect(await repo.count()).toBe(0)
				
			})
			
			it('#finder-fulltext', async() => {
				const
					model = new Fixtures.PDBModel1(),
					repo = coordinator.getRepo(Fixtures.PDBRepo1)
				
				Object.assign(model, {
					id: uuid.v4(),
					createdAt: Faker.date.past(),
					randomText: Faker.lorem.words(10)
				})
				
				const
					savedModel = await repo.save(model),
					key = repo.key(model.id),
					secondWord = model.randomText.split(' ')[ 2 ]
				
				let
					results = await repo.findByRandomText(secondWord)
				
				expect(results.length).toBe(1)
				
				await repo.remove(key)
				expect(await repo.count()).toBe(0)
				
			})
			
			
			
			it('#iterate finder request', async() => {
				const
					repo = coordinator.getRepo(Fixtures.PDBRepo1),
					models = []
				
				for (let i = 0; i < 10; i++) {
					const model = new Fixtures.PDBModel1()
					Object.assign(model, {
						id: 'a//' + i,
						name: "My Name",
						createdAt: Faker.date.past(),
						randomText: Faker.lorem.words(10)
					})
					
					models.push(model)
				}
				
				const
					savedModels = await repo.bulkSave(...models),
					loadedModels = []
				
				expect(savedModels.length).toBe(models.length)
				
				for (let i = 0; i < 100; i++) {
					
					const
						results = await repo.findByPrefix(new FinderRequest(5,i * 5,true),'a//')
					
					
					//log.info(`Got page ${i} - results`,results)
					if (!results.length) {
						log.info(`No results - the end`)
						break
					}
					
					loadedModels.push(...results)
				}
				
				expect(loadedModels.length).toBe(savedModels.length)
				
				savedModels.forEach((model,index) => {
					log.info(`Checking index ${index} with id ${model.id}`)
					expect(model.id).toBe(loadedModels[index].id)
				})
				
				// Now test a mango finder
				loadedModels.length = 0
				
				for (let i = 0; i < 100; i++) {
					
					const
						results = await repo.findByAnyNameWithRequest(new FinderRequest(5,i * 5,true),'My Name')
					
					
					log.info(`Got page ${i} - results`,results)
					if (!results.length) {
						log.info(`No results - the end`)
						break
					}
					
					loadedModels.push(...results)
				}
				
				expect(loadedModels.length).toBe(savedModels.length)
				
				savedModels.forEach((model,index) => {
					log.info(`Checking index ${index} with id ${model.id}`)
					expect(model.id).toBe(loadedModels[index].id)
				})
				
				
			})
			
			it('#keymapper', async() => {
				const
					repo = coordinator.getRepo(Fixtures.PDBRepo4),
					{ makeId } = Fixtures.PDBModel4
					
				const
					id = 'id1',
					second = '2',
					model = Object.assign(new Fixtures.PDBModel4(), {
						id,
						second,
						name: Faker.lorem.words(10)
					}),
					savedModel = await repo.save(model),
					loadedModel = await repo.get(makeId(id,second)),
					loadedRawIdModel = await repo.get(id)
				
				
				log.info(`Checking saved model`)
				expect(savedModel).not.toBeNull()
				
				log.info(`Checking loaded model`)
				expect(loadedModel).not.toBeNull()
				
				log.info(`Checking ids`)
				expect(loadedModel.id).toBe(id)
				expect(savedModel.id).toBe(id)
				expect(loadedRawIdModel).toBeNull()
				
				const
					finderIds = await repo.findIdsByMappedKey('id1')
				
				expect(finderIds.length).toBe(1)
				expect(finderIds[0]).toBe(makeId(id,second))
				
				
				await repo.remove(id)
				expect(await repo.count()).toBe(1)
				
				await repo.remove(makeId(id,second))
				expect(await repo.count()).toBe(0)
				
			})
			
			/**
			 * Finder prefix test
			 */
			it('#finder-prefix', async() => {
				const
					repo = coordinator.getRepo(Fixtures.PDBRepo3),
					{ makeId } = Fixtures.PDBModel3,
					group1Prefix = 'one',
					group1Count = 6,
					group2Prefix = 'two',
					group2Count = 11
				
				
				const makeBatch = async(prefix, count) => {
					const
						models = []
					
					for (let l = 0; l < count; l++) {
						const
							id = makeId(prefix, uuid.v4()),
							model = Object.assign(new Fixtures.PDBModel3(), {
								id,
								group1: prefix,
								name: Faker.lorem.words(10)
							})
						
						models.push(model)
					}
					
					const savedModels = await repo.bulkSave(...models)
					log.info(`Saved models length ${savedModels.length}`, savedModels[ 0 ])
				}
				
				await makeBatch(group1Prefix, group1Count)
				await makeBatch(group2Prefix, group2Count)
				
				log.info(`Checking group 1`)
				const group1Models = await repo.findByGroups(group1Prefix)
				expect(group1Models.length).toBe(group1Count)
				
				log.info(`Checking group 2`)
				const group2Models = await repo.findByGroups(group2Prefix)
				expect(group2Models.length).toBe(group2Count)
				
				
				
			})
			
			
			/**
			 * Bulk load test
			 */
			it('#bulk-load', (done) => {
				
				const
					repo = coordinator.getRepo(Fixtures.PDBRepo3),
					{ makeId } = Fixtures.PDBModel3,
					group1 = '' + 0
				
				let
					counter = -1,
					modelCount = 0
				
				repo
					.count()
					.then((startCount) => {
						const add10000 = async() => {
							counter++
							
							const
								group2 = '' + counter
							
							
							// Iterate 10 batches of 100
							for (let k = 0; k < 10; k++) {
								
								const
									group3 = '' + k,
									models = []
								
								for (let l = 0; l < 10; l++) {
									const
										id = makeId(group1, group2, group3, uuid.v4()),
										model = Object.assign(new Fixtures.PDBModel3(), {
											id,
											group1,
											group2,
											group3,
											name: Faker.lorem.words(1001)
										})
									
									models.push(model)
								}
								
								await repo.bulkSave(...models)
								
								modelCount += models.length
							}
							
							log.info(`GROUP = ${counter} / CURRENT MODEL COUNT = ${modelCount}`)
							
							if (counter < 10) {
								log.info(`waiting 1 seconds`)
								setTimeout(() => add10000(), 1000)
							} else {
								
								expect(await repo.count()).toBe(modelCount + startCount)
								done()
							}
						}
						
						// Start the iterations
						add10000()
					})
			})
			
			
		})
	}


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
