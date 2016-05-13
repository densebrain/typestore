const Log = require('./Log')
const log = Log.create(__filename)
const {msg,Strings} = require('./Messages')

process.on("unhandledRejection", function (reason, promise) {

	log.error(msg(Strings.PromiseUnhandledRejection, reason), reason.stack, reason,promise)
	throw reason
})

process.on("rejectionHandled", function (promise) {

})


//import Bluebird = require('bluebird')
//import * as Log from './log'
//import {msg, Strings} from "./Messages";



// Bluebird.config({
// 	cancellation: true,
// 	longStackTraces: true,
// 	warnings: true,
// 	monitoring: false
// })
//
// declare global {
// 	var Promise:Bluebird<any>
// }
//
// global.Promise = Bluebird

// NOTE: event name is camelCase as per node convention


