
// Load the global common runtime for build/test/tools
require('./etc/global-env')


const 
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	del = require('del'),
	tsdoc = require('gulp-typedoc'),
	runSequence = require('run-sequence'),
	git = require('gulp-git'),
	ghRelease = require('gulp-github-release'),
	ts = require('gulp-typescript'),
	glob = require('glob')



Object.assign(global,{
	glob,
	ts,
	gulp,
	runSequence,
	tsdoc,
	del,
	git,
	ghRelease
})

// Now map and configure all the projects/plugins
global.projects = projectNames.map(require('./etc/gulp/project-tasks'))

/**
 * Load auxillary tasks
 */

require('./etc/gulp/tasks')








