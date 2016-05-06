import {IDynamoDBManagerOptions} from "../DynamoDBTypes";
require('source-map-support').install()

//import 'es6-shim'
//import Promise from '../Promise'

import 'expectations'
import 'reflect-metadata'
import * as util from 'util'
import {SyncStrategy} from "../Types";
import {DynamoDBStore} from '../DynamoDBStore'

import {Manager} from '../index'
import {DynoModelKey,DynoAttrKey,DynamoDBLocalEndpoint} from '../Constants'
import * as Log from '../log'


const log = Log.create(__filename)
log.info('Starting test suite')

let Fixtures = null
let store = null


/**
 * Reset Dynotype and start all over
 *
 * @param syncStrategy
 * @param endpoint
 * @returns {Bluebird<U>}
 */
function reset(syncStrategy:SyncStrategy,endpoint:string) {
	// Init dynamo type
	// using local
	store = new DynamoDBStore()

	const opts:IDynamoDBManagerOptions = {
		dynamoEndpoint: endpoint,
		prefix: `test_${process.env.USER}_`,
		syncStrategy,
		store
	}

	if (!endpoint)
		delete opts['endpoint']

	delete require['./fixtures/index']

	return Manager.reset().then(() => {
			log.info('Manager reset, now init')
		})
		.then(() => Manager.init(opts))
		.then(() => {
			Fixtures = require('./fixtures/index')
		})



}


/**
 * Global test suite
 */
describe('DynoType',() => {


	/**
	 * Test for valid decorations
	 */
	describe('Decorators',() => {
		beforeEach(() => {
			return reset(SyncStrategy.None,DynamoDBLocalEndpoint)
		})

		it('decorates a new model',() => {
			const test1 = new Fixtures.Test1()

			const constructorFn = test1.constructor.prototype
			expect(constructorFn).toBe(Fixtures.Test1.prototype)

			const attrData = Reflect.getOwnMetadata(DynoAttrKey,constructorFn),
				modelData = Reflect.getOwnMetadata(DynoModelKey,constructorFn)


			expect(attrData.length).toEqual(3)
			expect(modelData.attrs.length).toEqual(3)
		})

		/**
		 * Creates a valid table definition
		 */
		it('Creates a valid table def', () => {
			new Fixtures.Test1()
			const modelOpts = Manager.findModelOptionsByClazz(Fixtures.Test1)
			const tableDef = store.tableDefinition(modelOpts.clazzName)


			expect(tableDef.KeySchema.length).toBe(2)
			expect(tableDef.AttributeDefinitions.length).toBe(2)
			expect(tableDef.AttributeDefinitions[0].AttributeName).toBe('id')
			expect(tableDef.AttributeDefinitions[0].AttributeType).toBe('S')
		})

	})


	describe('Client connects and CRUD',() => {
		beforeEach(() => {
			return reset(SyncStrategy.Overwrite,DynamoDBLocalEndpoint)
		})

		it("Can create a table for a model",() => {
			const test1 = new Fixtures.Test1()
			return Manager.start().then(() => {
				expect(store.availableTables.length).toBe(1)

			})
		})

		it('Can create data',() => {

			return Manager.start().then(() => {
				const test1Repo = Manager.store.getRepo(Fixtures.Test1Repo)
				util.inspect(test1Repo)
			})

		})
	})
})

