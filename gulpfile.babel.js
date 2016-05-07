const path = require('path')
const gulp = require('gulp')
const del = require('del')
const ts = require('gulp-typescript')
const merge = require('merge2')
const log = console

const sourceMaps = require('gulp-sourcemaps')
const relativeSourcemapsSource = require('gulp-relative-sourcemaps-source')


const projectNames = ['typestore','typestore-store-dynamodb']

const projects = projectNames.map((projectName) => {
	return {
		name: projectName,
		base: path.resolve(__dirname,'packages',projectName)

	}
})




const SourceMapModes = {
	SourceMap: 1,
	InlineSourceMap: 2
}

// Set the sourcemap mode
const sourceMapMode = SourceMapModes.SourceMap
const compileTasks = []
const allWatchConfigs = []

projects.forEach((project) => {
	log.info('Using src roots', project.srcs)
	const distPath = path.resolve(project.base,'dist')
	const srcs = [
		`${project.base}/typings/browser.d.ts`,
		`${project.base}/typings/${project.name}.d.ts`,
		`${project.base}/src/**/*.ts`,
		`${project.base}/test/**/*.ts`
	]

	const taskCompileName = `ts-compile-${project.name}`

	const tsProject = ts.createProject(path.resolve(project.base,'tsconfig.json'))

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
			tsResult.dts.pipe(gulp.dest(distPath)),
			tsResult.js.pipe(sourceMapHandler).pipe(gulp.dest(distPath))
		])
	}



	gulp.task(taskCompileName,[],compile)
	compileTasks.push(taskCompileName)
	allWatchConfigs.push({
		name: project.name,
		srcs: srcs,
		task: taskCompileName,
		base: project.base
	})
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

