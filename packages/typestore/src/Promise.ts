
const Bluebird = require('bluebird')
Bluebird.config({
	cancellation: true,
	longStackTraces: true,
	warnings: {
		wForgottenReturn: false
	},
	monitoring: true
})

const g = global as any

Promise = Bluebird
g.Promise = Bluebird

/**
 * Replace es6-promise with bluebird
 */
require('babel-runtime/core-js/promise').default = require('bluebird')



