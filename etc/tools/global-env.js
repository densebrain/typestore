require('source-map-support').install()
require('shelljs/global')
//require('./etc/packages-path')
// exec(`rm -Rf node_modules/gulp-typescript/node_modules/typescript &&
// ln -s ${process.cwd()}/node_modules/typescript node_modules/gulp-typescript/node_modules/typescript`)


const
	semver = require('semver'),
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	del = require('del'),
	tsdoc = require('gulp-typedoc'),
	log = console,
	runSequence = require('run-sequence'),
	git = require('gulp-git'),
	ghRelease = require('gulp-github-release'),
	projectConfigs = require('./projects.json'),
	projectNames = Object.keys(projectConfigs),
	helpers = require('./helpers'),
	{readJSONFileSync} = helpers

Object.assign(global,{
	processDir: process.cwd(),
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
	projectNames
})
