
const
	Bluebird = require('bluebird')

try {
	Bluebird.config({
		//cancellation: true,
		monitoring: process.env.NODE_ENV === 'development',
		longStackTraces: process.env.NODE_ENV === 'development',
		warnings: {
			wForgottenReturn: false
		}
	})
} catch (err) {
	try {
		console.warn(`Unable to configure promises, likely already configured`)
	} catch (err2) {}
}

const
	g = global as any

Promise = Bluebird
g.Promise = Bluebird

/**
 * Replace es6-promise with bluebird
 */
require('babel-runtime/core-js/promise').default = require('bluebird')



