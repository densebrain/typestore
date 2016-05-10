require('./etc/packages-path')

const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const del = require('del')
const ts = require('gulp-typescript')
const dts = require('dts-bundle')
const babel = require('gulp-babel')
const mocha = require('gulp-mocha')
const merge = require('merge2')
const log = console
const _ = require('lodash')
const sourceMaps = require('gulp-sourcemaps')
const runSequence = require('run-sequence')

const SourceMapModes = {
	SourceMap: 1,
	InlineSourceMap: 2
}

// Set the sourcemap mode
const sourceMapMode = SourceMapModes.SourceMap
const compileTasks = []
const allWatchConfigs = []


/**
 * All project names current in system
 *
 * @type {string[]}
 */
const projectNames = [
	'typestore',
	'typestore-mocks',
	'typestore-plugin-dynamodb',
	'typestore-plugin-cloudsearch'
]





// Now map and configure all the projects/plugins
const projects = projectNames.map((projectName) => {
	const project = {
		name: projectName,
		base: path.resolve(__dirname,'packages',projectName),
		tasks: {
			compile: `compile-${projectName}`,
			test: `test-${projectName}`
		}
	}

	/**
	 * Build the tasks
	 */
	const distPath = path.resolve(project.base,'dist')
	const srcPath = `${project.base}/src`
	
	const srcs = project.srcs = _.uniq([
		`${process.cwd()}/typings/browser.d.ts`,
		`${process.cwd()}/packages/typestore/typings/typestore.d.ts`,
		`${project.base}/typings/browser.d.ts`,
		`${project.base}/typings/${project.name}.d.ts`,
		`${srcPath}/**/*.ts`,
		`${project.base}/test/**/*.ts`
	])

	const tests = project.tests = [
		`${distPath}/**/*.spec.js`
	]

	const taskCompileName = project.tasks.compile
	const taskTestName = project.tasks.test

	const tsProject = ts.createProject(path.resolve(__dirname,'tsconfig.json'))

	const outPath = distPath //release ? distPath : srcPath

	/**
	 * Compile compile
	 * - the actual compilation
	 *
	 * @returns {*}
	 */
	function compile(release = false) {

		return () => {
			const sourcemapOpts = {
				sourceRoot: path.resolve(project.base, 'src'),
				includeContent: false
			}

			const tsResult = gulp.src(srcs)
				.pipe(sourceMaps.init())
				.pipe(ts(tsProject))

			log.info('Compilation Completed')

			const sourceMapHandler = (sourceMapMode === SourceMapModes.SourceMap) ?
				// External source maps
				sourceMaps.write('.', sourcemapOpts) :
				// Inline source maps
				sourceMaps.write(sourcemapOpts)

			return merge([
				tsResult.dts
					.pipe(gulp.dest(outPath)),
				tsResult.js
					.pipe(sourceMapHandler)
					.pipe(gulp.dest(outPath))
			]).on('end',() => {
				// Was used for external ambient types
				// log.info("creating declaration")
				// dts.bundle({
				// 	name: projectName,
				// 	main: `${distPath}/index.d.ts`,
				// 	exclude: /^test\/$/
				// })
			})
		}
		
	}






	gulp.task(taskCompileName,[],compile(false))
	gulp.task(taskTestName,[taskCompileName],makeMochaTask(tests))

	compileTasks.push(taskCompileName)
	allWatchConfigs.push({
		name: project.name,
		srcs: srcs,
		task: taskCompileName,
		base: project.base
	})



	return project
})


/**
 * Create a test task
 *
 * @param tests
 * @returns {function()}
 */
function makeMochaTask(tests = null) {
	return () => {
		if (!tests) {
			tests = []
			projects.forEach((project) => tests.push(...project.tests))
		}

		return gulp.src(tests)
			.pipe(mocha({reporter:'spec'}))

	}
}

/**
 * Gulp watch task, compiles on file change
 *
 * @param done
 */
function watch(done) {
	log.info('TypeScript Compilation Watching Files...')

	runSequence(...compileTasks,() => {
		allWatchConfigs.forEach((config) => {
			const watcher = gulp.watch(config.srcs, [config.task])
			watcher.on('change', (event) => {
				log.info("Project",config.name,"Files Changed: ", event.path)
			})
		})
	})
}


/**
 * Clean task
 */
function clean() {
	return del(['packages/*/dist/**/*.*'])
}

gulp.task('clean', [], clean)
gulp.task('compile-all', compileTasks, () => {})
gulp.task('compile-watch',[],watch)
gulp.task('test-all',[],makeMochaTask())
