require('source-map-support').install()
require('../packages-path')
require("babel-polyfill")
require('expectations')
require('reflect-metadata')

var Log = require('typestore').Log

if (!process.env.DEBUG)
	Log.setLogThreshold(Log.LogLevel.WARN)

global.getLogger = function(filename) {
	return Log.create(filename)
}
