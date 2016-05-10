require('source-map-support').install()
import 'expectations'
import 'reflect-metadata'
import {Types,Promise,Manager,Constants,Log,IndexType} from 'typestore'

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
	let Fixtures = require('./fixtures/index')

	function getTestModel() {
		t1 = new Fixtures.CloudSearchTestModel()
		t1.id = uuid.v4()
		t1.date = new Date()
		t1.text = 'asdfasdfadsf'
	}


	/**
	 * Set it up
	 */
	before(() => {
		return Manager
			.reset()
			.then(() => Manager.init({store}))
			.then(() => Manager.start(Fixtures.CloudSearchTestModel))
			.return(true)
	})


	/**
	 * Creates a valid table definition
	 */

	describe('#indexer',() => {

		it('#add', () => {
			getTestModel()

			let repo = Manager.getRepo(Fixtures.CloudSearchTest1Repo)

			//const mock = sinon.mock(repo)
			const stub = sinon.stub(repo,'save', function (o) {
				expect(o.id).toBe(t1.id)
				return this.index(IndexType.Add,o)
			})


			//mock.expects('save').once()
			return repo.save(t1)

		})

		it('#remove', () => {
			let repo = Manager.getRepo(Fixtures.CloudSearchTest1Repo)
			const stub = sinon.stub(repo, 'remove', function (o) {
				log.info('Fake remove object', o)
				expect(o.id).toBe(t1.id)
				return this.index(IndexType.Remove, o)
			})

			//const mock = sinon.mock(repo)
			//mock.expects('remove').once()
			return repo.remove(t1) //.then(() => mock.verify())
		})
	})

	//TODO: Add search test


})

