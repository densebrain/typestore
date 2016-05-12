require('source-map-support').install()
import 'expectations'
import 'reflect-metadata'
import * as Faker from 'faker'
import * as Fixtures from './fixtures/index'
import {
	Types,
	Promise,
	Coordinator,
	Constants,
	Log,
	IndexAction
} from 'typestore'

if (!process.env.DEBUG)
	Log.setLogThreshold(Log.LogLevel.WARN)

import * as sinon from 'sinon'
import * as uuid from 'node-uuid'
import {MockStore} from "typestore-mocks"

const {TypeStoreModelKey,TypeStoreAttrKey} = Constants


const log = Log.create(__filename)
log.info('Starting test suite')


let store:MockStore = new MockStore()

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
	before(() => {
		Coordinator
			.reset()
			.then(() => Coordinator.init({},store))
			.then(() => Coordinator.start(Fixtures.CloudSearchTestModel))
			.return(true)
	})


	/**
	 * Creates a valid table definition
	 */

	describe('#indexer',() => {

		it('#add', () => {
			getTestModel()

			let repo = Coordinator.getRepo(Fixtures.CloudSearchTest1Repo)

			//const mock = sinon.mock(repo)
			const stub = sinon.stub(repo,'save', function (o) {
				expect(o.id).toBe(t1.id)
				return this.index(IndexAction.Add,o)
			})


			//mock.expects('save').once()
			return repo.save(t1)

		})

		it('#remove', () => {
			let repo = Coordinator.getRepo(Fixtures.CloudSearchTest1Repo)
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

		it('#add+search+remove', () => {
			getTestModel()

			let repo = Coordinator.getRepo(Fixtures.CloudSearchTest1Repo)

			//const mock = sinon.mock(repo)
			const stub = sinon.stub(repo, 'save', function (o) {
				expect(o.id).toBe(t1.id)
				return this.index(IndexAction.Add, o)
			})

			return repo.save(t1)
				.then((t2) => {
					return repo.findByText(t1.text.split(' ')[0])
				})
				.then((searchResults) => {
					expect(searchResults.length).toBeGreaterThan(0)
					log.info(searchResults)
					return true
				})
		})
	})

			//TODO: Add search test


})

