import * as BBPromise from 'bluebird'
import * as Log from './log'
import {msg, Strings} from "./Messages";

const log = Log.create(__filename)

BBPromise.config({
	cancellation: true,
	longStackTraces: true,
	warnings: true,
	monitoring: false
})


// NOTE: event name is camelCase as per node convention
process.on("unhandledRejection", function (reason, promise) {
	log.error(msg(Strings.PromiseUnhandledRejection, reason), reason, promise)
})

// NOTE: event name is camelCase as per node convention
process.on("rejectionHandled", function (promise) {
	//log.debug(msg(Strings.PromiseRejected))
})

global.Promise = BBPromise

export = BBPromise
