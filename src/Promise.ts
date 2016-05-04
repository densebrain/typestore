///<reference path="../typings/browser/definitions/bluebird/index.d.ts"/>

import * as Bluebird from 'bluebird'
import * as Log from './log'
import {msg, Strings} from "./Messages";


const log = Log.create(__filename)



Bluebird.config({
	cancellation: true,
	longStackTraces: true,
	warnings: true,
	monitoring: true
})

// NOTE: event name is camelCase as per node convention
process.on("unhandledRejection", function(reason, promise) {
	log.error(msg(Strings.PromiseUnhandledRejection,reason),reason,promise)
})

// NOTE: event name is camelCase as per node convention
process.on("rejectionHandled", function(promise) {
	//log.debug(msg(Strings.PromiseRejected))
})


export default Bluebird
