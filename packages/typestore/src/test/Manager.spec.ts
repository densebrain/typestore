
const Promise = require('../Promise')
global.Promise = Promise

require('source-map-support').install()


import {FakeStore} from "./fixtures/FakeStore";
import 'expectations'
import 'reflect-metadata'

import {SyncStrategy, IManagerOptions} from "../Types";

import {Manager} from '../Manager'
import {DynoModelKey,DynoAttrKey} from '../Constants'
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
function reset(syncStrategy:SyncStrategy) {

	store = new FakeStore()

	const opts:IManagerOptions = {
		syncStrategy,
		store
	}

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
describe('#typestore',() => {


	/**
	 * Test for valid decorations
	 */
	describe('#decorators',() => {
		beforeEach(() => {
			return reset(SyncStrategy.None)
		})

		it('#model',() => {
			const test1 = new Fixtures.Test1()

			const constructorFn = test1.constructor.prototype
			expect(constructorFn).toBe(Fixtures.Test1.prototype)

			const attrData = Reflect.getOwnMetadata(DynoAttrKey,constructorFn),
				modelData = Reflect.getOwnMetadata(DynoModelKey,constructorFn)


			expect(attrData.length).toEqual(3)
			expect(modelData.attrs.length).toEqual(3)
		})



	})

	//
	// describe('#store',() => {
	// 	beforeEach(() => {
	// 		return reset(SyncStrategy.Overwrite)
	// 	})
	//
	// 	it("#sync",() => {
	// 		const test1 = new Fixtures.Test1()
	// 		return Manager.start().then(() => {
	// 			expect(store.availableTables.length).toBe(1)
	//
	// 		})
	// 	})
	//
	// 	describe('#repo',() => {
	// 		let t1 = null
	// 		let test1Repo = null
	// 		before(() => {
	// 			t1 = new Fixtures.Test1()
	// 			t1.id = uuid.v4()
	// 			t1.createdAt = new Date().getTime()
	// 			t1.randomText = 'asdfasdfadsf'
	//
	// 			return Manager.start().then(() => {
	// 				test1Repo = Manager.getRepo(Fixtures.Test1Repo)
	// 			})
	// 		})
	//
	// 		it('#create', () => {
	// 			return test1Repo.save(t1)
	// 				.then(() => test1Repo.count())
	// 				.then((rowCount) => {
	// 					expect(rowCount).toBe(1)
	// 				})
	//
	// 		})
	//
	// 		it('#get',() => {
	// 			return test1Repo.get(test1Repo.key(t1.id,t1.createdAt))
	// 				.then((t2) => {
	// 					expect(t1.id).toBe(t2.id)
	// 					expect(t1.createdAt).toBe(t2.createdAt)
	// 					expect(t1.randomText).toBe(t2.randomText)
	// 				})
	//
	// 		})
	//
	// 		it('#finder',() => {
	// 			return test1Repo.findByRandomText('asdfasdfadsf')
	// 				.then((items) => {
	// 					expect(items.length).toBe(1)
	// 					const t2 = items[0]
	// 					expect(t1.id).toBe(t2.id)
	// 					expect(t1.createdAt).toBe(t2.createdAt)
	// 					expect(t1.randomText).toBe(t2.randomText)
	// 				})
	// 		})
	//
	// 		it('#delete',() => {
	// 			return test1Repo.remove(test1Repo.key(t1.id,t1.createdAt))
	// 				.then(() => test1Repo.count())
	// 				.then((rowCount) => {
	// 					expect(rowCount).toBe(0)
	// 				})
	//
	// 		})
	// 	})
	//})
})

