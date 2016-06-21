const Bluebird = require('bluebird')
Bluebird.config({
	cancellation: true,
	longStackTraces: true,
	warnings: true,
	monitoring: true
})

const g = global as any

/**
 * Replace es6-promise with bluebird
 */
require('babel-runtime/core-js/promise').default = require('bluebird')

// const Log = require('./log')
// const log = Log.create(__filename)


// process.on("unhandledRejection", function (reason, promise) {
// 	log.error(msg(Strings.PromiseUnhandledRejection, reason), reason.stack, reason,promise)
// })
//
// process.on("rejectionHandled", function (promise) {
//
// })

Promise = Bluebird

