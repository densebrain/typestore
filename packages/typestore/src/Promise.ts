

import * as Bluebird from 'bluebird'

declare global {
	var Promise:typeof Bluebird
}



Bluebird.config({
	cancellation: true,
	longStackTraces: true,
	warnings: {
		wForgottenReturn: false
	},
	monitoring: true
})

// Object.assign(global as any,{
// 	Promise:Bluebird
// })



/**
 * Replace es6-promise with bluebird
 */
require('babel-runtime/core-js/promise').default = require('bluebird')

export const Promise = Bluebird




