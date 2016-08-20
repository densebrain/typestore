/* global log */
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const {readJSONFileSync} = require('../tools/helpers')

const babelDefaultConfig = readJSONFileSync(path.resolve(__dirname,'../.././.babelrc'))

module.exports = {
	makeBabelConfig(project) {

		// Load the babel config
		let babelConfig = null
		
		// If load fails, set to empty
		try {
			const babelPath = path.resolve(project.base, '.babelrc')
			if (fs.existsSync(babelPath)) {
				log.info(`Loading babel project config: ${babelPath}`)
				babelConfig = readJSONFileSync(babelPath)
			}
		} catch (e) {
			log.error('Failed to load babel config', e)
			
			// Set to
			babelConfig = {}
		}

		return _.defaultsDeep(babelConfig, babelDefaultConfig)
	}
}