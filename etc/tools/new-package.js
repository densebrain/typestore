require('shelljs/global')
const
	path = require('path'),
	fs = require('fs')

const {
	readJSONFileSync,
	writeJSONFileSync
} = require('./helpers')


function makePackageJson(name,config) {
	return JSON.stringify({
		name,
		description: config.description,
		version: require('../../package.json').version,
		main: "dist/index.js",
		typings: "dist/index.d.ts",
		scripts: {
			test: "gulp ts-compile && mocha src/test/**/*.spec.js"
		}
	},null,4)
}


function makeTypingsJson(name,config) {
	return JSON.stringify({
		name,
		version: false,
		dependencies: {

		},
		ambientDependencies: {

		},
		ambientDevDependencies: {

		}
	},null,4)
}

/**
 * Creates a new project definition and
 * all required assets, finally update
 * etc/projects.json
 * 
 * @param name
 * @param config
 */

module.exports = function (name,config) {
	const baseDir = path.resolve(__dirname,'../..')
	const packageDir = path.resolve(baseDir,'packages',name)
	if (fs.existsSync(packageDir))
		throw new Error(`Package directory already exists ${packageDir}`)


	mkdir('-p',`${packageDir}/src/test`)
	mkdir('-p',`${packageDir}/typings`)
	echo(`# TypeStore Module (${name})\n\nReadme goes here`).to(`${packageDir}/README.md`)
	echo(`/// <reference path="../../../typings/browser.d.ts"/>`).to(`${packageDir}/typings/${name}.d.ts`)
	echo(`/// <reference path="../typings/${name}.d.ts"/>\n\nexport {\n\n}`).to(`${packageDir}/src/index.ts`)
	echo(makeTypingsJson(name,config)).to(`${packageDir}/typings.json`)
	echo(makePackageJson(name,config)).to(`${packageDir}/package.json`)
	
	
	// Update the projects.json
	const projectsFile = path.resolve(baseDir,'etc/projects.json')

	const projects = readJSONFileSync(projectsFile)
	projects[name] = config

	writeJSONFileSync(projectsFile,projects)
	
	
}