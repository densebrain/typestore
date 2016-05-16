
import {runCars} from '../index'

describe('#examples-node', () => {
	it('#runCars',async () => {
		expect(await runCars()).toBe(true)
	})
})