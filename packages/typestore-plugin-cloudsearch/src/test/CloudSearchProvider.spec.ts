

const AWS = require('aws-sdk')


const sharedIniCreds =  new AWS.SharedIniFileCredentials({profile: 'default'})

import * as Faker from 'faker'
import {CloudSearchTestModel,CloudSearchTest1Repo} from './fixtures/index'
import * as sinon from 'sinon'
import * as uuid from 'node-uuid'

import * as TypeStore from 'typestore'
import {Coordinator,Log,IndexAction} from 'typestore'
import {MockStore} from "typestore-mocks"
import {CloudSearchProviderPlugin} from "../CloudSearchProviderPlugin"
import {CloudSearchLocalEndpoint} from "../CloudSearchConstants"

const log = Log.create(__filename)

let coordinator:Coordinator = null

/**
 * Make the cloud search plugin
 */
const cloudSearchProvider = new CloudSearchProviderPlugin({
	endpoint: CloudSearchLocalEndpoint,
	awsOptions: {
		region: 'us-east-1',
		credentials:sharedIniCreds
	}
},CloudSearchTestModel)

/**
 * Create a mock store for managing the model instances
 *
 * @type {MockStore}
 */
let store:MockStore = new MockStore(CloudSearchTestModel)


/**
 * Global test suite
 *
 * TODO: Somehow integrated mocked service
 */
xdescribe('#plugin-cloudsearch',() => {
	let t1 = null
	function getTestModel() {
		t1 = new CloudSearchTestModel()
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
		await coordinator.start(CloudSearchTestModel)
	})


	/**
	 * Creates a valid table definition
	 */

	describe('#indexer',() => {

		it('#add', () => {
			getTestModel()

			let repo = coordinator.getRepo(CloudSearchTest1Repo)

			//const mock = sinon.mock(repo)
			const stub = sinon.stub(repo,'save', function (o) {
				expect(o.id).toBe(t1.id)
				return this.index(IndexAction.Add,o)
			})


			//mock.expects('save').once()
			return repo.save(t1)

		})

		it('#remove', () => {
			let repo = coordinator.getRepo(CloudSearchTest1Repo)
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

			let repo = coordinator.getRepo(CloudSearchTest1Repo)

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




})

