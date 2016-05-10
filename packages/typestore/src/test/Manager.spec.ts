require('source-map-support').install()
import * as Log from '../log'

if (!process.env.DEBUG) 
	Log.setLogThreshold(Log.LogLevel.WARN)

import 'expectations'
import 'reflect-metadata'

import Promise = require('../Promise')

import {SyncStrategy, IManagerOptions,ManagerOptions} from "../Types";
import {NullStore} from "./fixtures/NullStore";
import {Manager} from '../Manager'
import {TypeStoreModelKey,TypeStoreAttrKey} from '../Constants'


const log = Log.create(__filename)

log.info('Starting test suite')

let Fixtures = null
let store = null


/**
 * Reset TypeStore and start all over
 *
 * @param syncStrategy
 * @returns {Bluebird<U>}
 */
function reset(syncStrategy:SyncStrategy) {

	store = new NullStore()

	const opts = new ManagerOptions(store,{
		syncStrategy,
		store
	})

	delete require['./fixtures/Fixtures']

	return Manager.reset().then(() => {
			log.info('Manager reset, now init')
		})
		.then(() => Manager.init(opts))
		.then(() => {
			Fixtures = require('./fixtures/Fixtures')
		})

}


/**
 * Global test suite
 */
describe('#typestore',() => {


	/**
	 * Test for valid decorations
	 */
	describe('#decorators',() => {
		beforeEach(() => {
			return reset(SyncStrategy.None)
		})

		it('#model',() => {
			Manager.start(Fixtures.ModelTest1)
			const test1 = new Fixtures.ModelTest1()

			const constructorFn = Fixtures.ModelTest1
			expect(constructorFn).toBe(Fixtures.ModelTest1)

			const attrData = Reflect.getOwnMetadata(TypeStoreAttrKey,constructorFn),
				modelData = Reflect.getOwnMetadata(TypeStoreModelKey,constructorFn)


			expect(attrData.length).toEqual(3)
			expect(modelData.attrs.length).toEqual(3)
		})
	})
})

