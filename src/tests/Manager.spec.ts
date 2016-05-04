require('source-map-support').install()

import {SyncStrategy} from "../Types";
import 'reflect-metadata'
import 'es6-shim'
import 'expectations'
import Promise from '../Promise'

import {DynamoDBStore,IDynamoDBManagerOptions} from '../DynamoDBStore'

import {Manager} from '../index'
import * as Log from '../log'
import {DynoModelKey,DynoAttrKey,LocalEndpoint} from '../Constants'


const log = Log.create(__filename)
log.info('Starting test suite')

let Fixtures = null
let store = null

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

describe('DynoType',() => {


	/**
	 * Test for valid decorations
	 */
	describe('Decorators',() => {
		beforeEach(() => {
			return reset(SyncStrategy.None,LocalEndpoint)
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
			return reset(SyncStrategy.Overwrite,LocalEndpoint)
		})

		it("Can create a table for a model",() => {
			const test1 = new Fixtures.Test1()
			return Manager.start().then(() => {
				expect(store.availableTables.length).toBe(1)

			})
		})

		it('Can create data',() => {

			return Manager.start().then(() => {
				Manager.store.getModelRepo(Fixtures.Test1)

			})

		})
	})
})

