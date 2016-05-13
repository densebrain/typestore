const log = getLogger(__filename)
log.info('Starting test suite')

import {SyncStrategy,CoordinatorOptions} from "../Types";
import {NullStore} from "./fixtures/NullStore"
import {Coordinator} from '../Coordinator'
import {TypeStoreModelKey,TypeStoreAttrKey} from '../Constants'
import * as Fixtures from './fixtures/Fixtures'

let store = null


/**
 * Reset TypeStore and start all over
 *
 * @param syncStrategy
 * @returns {Bluebird<U>}
 */
async function reset(syncStrategy:SyncStrategy) {

	store = new NullStore()

	log.info('Coordinator reset, now init')

	await Coordinator.reset()
	await Coordinator.init(new CoordinatorOptions({syncStrategy}),store)

	return Coordinator
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

		it('#model', async () => {
			await Coordinator.start(Fixtures.ModelTest1)

			//new Fixtures.ModelTest1()

			const constructorFn = Fixtures.ModelTest1
			expect(constructorFn).toBe(Fixtures.ModelTest1)

			const attrData = Reflect.getOwnMetadata(TypeStoreAttrKey,constructorFn),
				modelData = Reflect.getOwnMetadata(TypeStoreModelKey,constructorFn)


			expect(attrData.length).toEqual(3)
			expect(modelData.attrs.length).toEqual(3)
		})
	})
})

