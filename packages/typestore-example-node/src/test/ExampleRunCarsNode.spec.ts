
import {runCars} from '../index'

// TODO: Local cloudsearch
xdescribe('#examples-node', function() {
	this.timeout(60000)

	it('#runCars',async () => {
		expect(await runCars()).toBe(true)
	})
})