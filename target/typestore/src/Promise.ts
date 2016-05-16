const Bluebird = require('bluebird')
Bluebird.config({
	cancellation: true,
	longStackTraces: true,
	warnings: true,
	monitoring: false
})

const Log = require('./log')
const log = Log.create(__filename)
const {msg,Strings} = require('./Messages')

process.on("unhandledRejection", function (reason, promise) {
	log.error(msg(Strings.PromiseUnhandledRejection, reason), reason.stack, reason,promise)
})

process.on("rejectionHandled", function (promise) {

})

Promise = Bluebird

