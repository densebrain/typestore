const path = require('path')
const gulp = require('gulp')
const del = require('del')
const ts = require('gulp-typescript')

const log = console

const sourceMaps = require('gulp-sourcemaps')
const relativeSourcemapsSource = require('gulp-relative-sourcemaps-source')
const tsProject = ts.createProject('./tsconfig.json')
const srcPaths = ['typings/browser.d.ts','src/**/*.ts']
log.info('Using src roots',srcPaths)


const SourceMapModes = {
	SourceMap: 1,
	InlineSourceMap: 2
}

// Set the sourcemap mode
const sourceMapMode = SourceMapModes.SourceMap

function clean() {
	return del(['dist/**/*.*'])
}

/**
 * Compile compile
 * - the actual compilation
 *
 * @returns {*}
 */
function compile() {

	const sourcemapOpts = {
		sourceRoot: path.relative("./dist/",'./src/'),
		//sourceRoot: '.',
		includeContent: false
	}

	const tsResult = gulp.src(srcPaths)
		.pipe(sourceMaps.init())
		.pipe(ts(tsProject))

	log.info('Compilation Completed')

	return tsResult
		//.pipe(relativeSourcemapsSource({dest:'dist'}))
		.pipe((sourceMapMode === SourceMapModes.SourceMap) ?
			// External source maps
			sourceMaps.write('.',sourcemapOpts) :
			// Inline source maps
			sourceMaps.write(sourcemapOpts)
		)
		.pipe(gulp.dest('dist'))
}




/**
 * Gulp watch task, compiles on file change
 *
 * @param done
 */
function watch(done) {
	log.info('TypeScript Compilation Watching Files...')

	const watcher = gulp.watch(srcPaths,['ts-compile'])
	watcher.on('change',(event) => {
		log.info("Files Changed: ",event.path)
	})

}

gulp.task('clean',[],clean)
gulp.task('ts-compile',['clean'],compile)
gulp.task('ts-compile-watch',['ts-compile'],watch)

