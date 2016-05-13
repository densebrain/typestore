Promise = require('bluebird')
const log = getLogger(__filename)

import * as Faker from 'faker'
import * as Fixtures from './fixtures/index'
import {
	Types,
	Coordinator,
	Constants,
	Log,
	IndexAction
} from 'typestore'

import * as sinon from 'sinon'
import * as uuid from 'node-uuid'
import {MockStore} from "typestore-mocks"

const {TypeStoreModelKey,TypeStoreAttrKey} = Constants

log.info('Starting test suite')

let cloudSearchProvider = Fixtures.cloudSearchProvider
let store:MockStore = new MockStore()
let coordinator:Coordinator = null
/**
 * Global test suite
 */
xdescribe('#plugin-cloudsearch',() => {
	let t1 = null
	function getTestModel() {
		t1 = new Fixtures.CloudSearchTestModel()
		t1.id = uuid.v4()
		t1.date = new Date()
		t1.text = Faker.lorem.words(15)
	}


	/**
	 * Set it up
	 */
	before(async () => {
		if (coordinator)
			await coordinator.stop()

		coordinator = new Coordinator()
		await coordinator.init({},store,cloudSearchProvider)
		await coordinator.start(Fixtures.CloudSearchTestModel)
	})


	/**
	 * Creates a valid table definition
	 */

	describe('#indexer',() => {

		it('#add', () => {
			getTestModel()

			let repo = coordinator.getRepo(Fixtures.CloudSearchTest1Repo)

			//const mock = sinon.mock(repo)
			const stub = sinon.stub(repo,'save', function (o) {
				expect(o.id).toBe(t1.id)
				return this.index(IndexAction.Add,o)
			})


			//mock.expects('save').once()
			return repo.save(t1)

		})

		it('#remove', () => {
			let repo = coordinator.getRepo(Fixtures.CloudSearchTest1Repo)
			const stub = sinon.stub(repo, 'remove', function (o) {
				log.info('Fake remove object', o)
				expect(o.id).toBe(t1.id)
				return this.index(IndexAction.Remove, o)
			})

			//const mock = sinon.mock(repo)
			//mock.expects('remove').once()
			return repo.remove(t1) //.then(() => mock.verify())
		})
	})


	describe('#search',() => {

		it('#add+search+remove', async () => {
			getTestModel()

			let repo = coordinator.getRepo(Fixtures.CloudSearchTest1Repo)

			//const mock = sinon.mock(repo)
			const stub = sinon.stub(repo, 'save', function (o) {
				expect(o.id).toBe(t1.id)
				return this.index(IndexAction.Add, o)
			})

			let t2 = await repo.save(t1)
			let searchResults = await repo.findByText(t1.text.split(' ')[0])

			expect(searchResults.length).toBeGreaterThan(0)
			log.info(searchResults)
			return true

		})
	})

			//TODO: Add search test


})

