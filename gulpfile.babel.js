const path = require('path')
const gulp = require('gulp')
const ts = require('gulp-typescript')

const log = console

const sourcemaps = require('gulp-sourcemaps')
const tsProject = ts.createProject('./tsconfig.json')
const srcPaths = ['typings/browser.d.ts','src/**/*.ts']
log.info('Using src roots',srcPaths)


function compile() {

	const tsResult = gulp.src(srcPaths)
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject))

	log.info('Compilation Completed')

	const sourcemapOpts = {
		sourceRoot: path.resolve(__dirname,'src')
	}

	return tsResult
		.pipe(sourcemaps.write('.',sourcemapOpts))
		//.pipe(sourcemaps.write(sourcemapOpts))
		.pipe(gulp.dest('dist'))
}

gulp.task('ts-compile',[],compile)


function watch(done) {
	log.info('TypeScript Compilation Watching Files...')

	const watcher = gulp.watch(srcPaths,['ts-compile'])
	watcher.on('change',(event) => {
		log.info("Files Changed: ",event.path)
	})

}

gulp.task('ts-compile-watch',['ts-compile'],watch)

