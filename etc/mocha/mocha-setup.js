require('source-map-support').install()
require('../packages-path')

require("babel-polyfill")
require('expectations')
require('reflect-metadata')

var Log = require('typestore').Log

if (!process.env.DEBUG)
	Log.setLogThreshold(Log.LogLevel.WARN)

global.getLogger = function(filename) {
	return console
}


//global.Promise = global.BBPromise = require('../../packages/typestore/dist/Promise')
//global.assert = require('assert')