require('source-map-support').install()
require('../packages-path')


require("babel-polyfill")
require('expectations')
require('reflect-metadata')


const
	Bluebird = require('bluebird'),
	Log = require('typelogger')

Bluebird
	.config({
		cancellation: true,
		longStackTraces: true,
		warnings: true,
		monitoring: false
	})

Log.setLogThreshold(process.env.DEBUG ? Log.LogLevel.DEBUG : Log.LogLevel.WARN )
 
Object.assign(global,{
	Promise:Bluebird,
	getLogger: Log.create
})




//global.Promise = global.BBPromise = require('../../packages/typestore/dist/Promise')
//global.assert = require('assert')