//require('source-map-support').install()
import 'reflect-metadata'
import 'expectations'

import * as Dyno from '../index'
import * as Log from '../log'
import {DynoModelKey,DynoAttrKey,LocalEndpoint} from '../Constants'

const {Manager} = Dyno

const log = Log.create(__filename)
log.info('Starting test suite')

let Fixtures = null

function reset(createTables:boolean,endpoint:string) {
	// Init dynamo type
	// using local
	const opts = {
		dynamoEndpoint: endpoint,
		createTables: createTables,
		prefix: `test_${process.env.USER}_`
	}

	if (!endpoint)
		delete opts['endpoint']


	Manager.init(opts)

	delete require['./fixtures/index']
	Fixtures = require('./fixtures/index')
}

describe('dynotype',() => {



	describe('Decorators',() => {
		beforeEach(() => {
			reset(false,LocalEndpoint)
		})

		it('decorates a new model',() => {
			const test1 = new Fixtures.Test1()

			const constructorFn = test1.constructor.prototype
			expect(constructorFn).toBe(Fixtures.Test1.prototype)

			const attrData = Reflect.getOwnMetadata(DynoAttrKey,constructorFn),
				modelData = Reflect.getOwnMetadata(DynoModelKey,constructorFn)

			expect(attrData.length).toEqual(2)
			expect(modelData.attrs.length).toEqual(2)

		})
	})

	describe('Client connects and works',() => {
		beforeEach(() => {
			reset(true,LocalEndpoint)
		})

		it("Can create a table for a model",(done) => {


			done()
		})
	})
})

