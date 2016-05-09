require('source-map-support').install()

import 'expectations'
import 'reflect-metadata'
import * as sinon from 'sinon'
import * as uuid from 'node-uuid'


import {Types,Promise,Manager,Constants,Log,IndexType} from 'typestore'
import {MockStore} from "typestore-mocks"


const {TypeStoreModelKey,TypeStoreAttrKey} = Constants


const log = Log.create(__filename)
log.info('Starting test suite')


let store:MockStore = new MockStore()

/**
 * Global test suite
 */
describe('#plugin-cloudsearch',() => {
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
			.init({store})
			.then(() => Manager.start(Fixtures.CloudSearchTestModel))
			.return(true)
	})


	/**
	 * Creates a valid table definition
	 */
	//TODO: Add indexer test
	//TODO: Remove indexer test
	 
	describe('#indexer',() => {

		it('#add', () => {
			getTestModel()

			return Promise.try(() => {
				let repo = Manager.getRepo(Fixtures.CloudSearchTest1Repo)

				//const mock = sinon.mock(repo)
				const stub = sinon.stub(repo,'save', function (o) {
					log.info('Fake saving object',o)
					expect(o.id).toBe(t1.id)
					return this.index(IndexType.Add,o)
				})


				//mock.expects('save').once()
				return repo.save(t1)

			})



		})

		it('#remove', () => {
			return Promise.try(() => {
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
	})


})

