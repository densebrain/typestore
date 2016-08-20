require('source-map-support').install()
require('shelljs/global')


const
	semver = require('semver'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	tsc= require('typescript'),
	log = console,
	projectConfigs = require('./projects.json'),
	projectNames = Object.keys(projectConfigs),
	helpers = require('./tools/helpers'),
	{readJSONFileSync} = helpers

Object.assign(global,{
	_,
	tsc,
	processDir: path.resolve(__dirname,'..'),
	basePackageJson: readJSONFileSync('./package.json')
},helpers)

// Config for release and versioning
Object.assign(global,{
	nextMinorVersion: semver.inc(basePackageJson.version,'patch'),
	releaseFiles: [],
	compileTasks:[],
	allWatchConfigs:[],
	releaseDir: `${process.cwd()}/target/releases`,
	projectConfigs,
	projectNames,
	log
})
