require('source-map-support').install()

import 'expectations'
import 'reflect-metadata'
import * as sinon from 'sinon'
import * as uuid from 'node-uuid'

import {FakeStore} from "../../../typestore/src/test/fixtures/FakeStore"
import {Types,Promise,Manager,Constants,Log} from 'typestore'

const {TypeStoreModelKey,TypeStoreAttrKey} = Constants


const log = Log.create(__filename)
log.info('Starting test suite')

let Fixtures = null

let store:FakeStore

/**
 * Reset Dynotype and start all over
 *
 * @param syncStrategy
 * @param endpoint
 * @returns {Bluebird<U>}
 */
function reset(syncStrategy:Types.SyncStrategy) {
	// Init dynamo type
	// using local
	store = new FakeStore()


	delete require['./fixtures/index']

	return Manager.reset().then(() => {
			log.info('Manager reset, now init')
		})
		.then(() => Manager.init({store}))
		.then(() => {
			Fixtures = require('./fixtures/index')
		})
}


/**
 * Global test suite
 */
describe('#plugin-cloudsearch',() => {

	/**
	 * Set it up
	 */
	before(() => {
		return reset(Types.SyncStrategy.Overwrite)
			.then(() => {
				Manager.start(Fixtures.CloudSearchTestModel).then(() => {
					return true
				})
			})
	})

	/**
	 * Creates a valid table definition
	 */
	/**
	 * TODO: Add indexer test
	 * TODO: Remove indexer test
	 */
	describe('#indexer',() => {


		it('#add', () => {
			let repo = Manager.getRepo(Fixtures.CloudSearchTest1Repo)
			sinon.stub(repo,'save', (o) => {
				log.info('Fake saving object',o)
			})
		})

		it('#remove', () => {
			Manager.start(Fixtures.CloudSearchTestModel).then(() => {
				Manager.getRepo(Fixtures.Test1Repo)
			})
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

