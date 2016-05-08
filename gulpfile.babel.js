const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const del = require('del')
const ts = require('gulp-typescript')
const dts = require('dts-bundle')
const babel = require('gulp-babel')
const merge = require('merge2')
const log = console
const _ = require('lodash')
const sourceMaps = require('gulp-sourcemaps')


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
	'typestore-plugin-dynamodb'
]




// Now map and configure all the projects/plugins
const projects = projectNames.map((projectName) => {
	const project = {
		name: projectName,
		base: path.resolve(__dirname,'packages',projectName),
		tasks: {
			compile: `ts-compile-${projectName}`
		}
	}



	/**
	 * Build the tasks
	 */
	log.info('Using src roots', project.srcs)
	const distPath = path.resolve(project.base,'dist')
	const srcs = _.uniq([
		`${process.cwd()}/typings/browser.d.ts`,
		`${process.cwd()}/packages/typestore/typings/typestore.d.ts`,
		`${project.base}/typings/browser.d.ts`,
		`${project.base}/typings/${project.name}.d.ts`,
		`${project.base}/src/**/*.ts`,
		`${project.base}/test/**/*.ts`
	])

	const taskCompileName = project.tasks.compile

	const tsProject = ts.createProject(path.resolve(__dirname,'tsconfig.json'))

	/**
	 * Compile compile
	 * - the actual compilation
	 *
	 * @returns {*}
	 */
	function compile() {

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
				.pipe(gulp.dest(distPath)),
			tsResult.js
				//.pipe(babel(babelConfig))
				.pipe(sourceMapHandler)
				.pipe(gulp.dest(distPath))
		]).on('end',() => {

			// log.info("creating declaration")
			// dts.bundle({
			// 	name: projectName,
			// 	main: `${distPath}/index.d.ts`,
			// 	exclude: /^test\/$/
			// })
		})
	}



	gulp.task(taskCompileName,[],compile)
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
 * Gulp watch task, compiles on file change
 *
 * @param done
 */
function watch(done) {
	log.info('TypeScript Compilation Watching Files...')

	allWatchConfigs.forEach((config) => {
		const watcher = gulp.watch(config.srcs, [config.task])
		watcher.on('change', (event) => {
			log.info("Project",config.name,"Files Changed: ", event.path)
		})
	})

}



function clean() {
	return del(['packages/*/dist/**/*.*'])
}

gulp.task('clean', [], clean)
gulp.task('ts-compile-all', ['clean'].concat(compileTasks), () => {})
gulp.task('ts-compile-watch',compileTasks,watch)

