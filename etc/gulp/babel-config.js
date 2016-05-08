const fs = require('fs')
const path = require('path')
const _ = require('lodash')

function readJSONFileSync(filename) {
	return JSON.parse(fs.readFileSync(filename,'utf-8'))
}

const babelDefaultConfig = readJSONFileSync(path.resolve(__dirname,'./.babelrc'))

module.exports = function getBabelConfig() {
	/**
	 * Load the babel config
	 *
	 * @type {null}
	 */
	let babelConfig = null
	try {
		const babelPath = path.resolve(project.base,'.babelrc')
		if (fs.existsSync(babelPath)) {
			log.info(`Loading babel project config: ${babelPath}`)
			babelConfig = readJSONFileSync(babelPath)
		}
	} catch (e) {
		log.error('Failed to load babel config',e)
	}
	
	babelConfig = babelConfig || {}
	return _.defaultsDeep(babelConfig,babelDefaultConfig)

}