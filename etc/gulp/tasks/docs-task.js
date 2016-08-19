
/**
 * Run all compile tasks sequentially
 */
function docs() {

	// return gulp
	// 	.src([
	// 		'packages/typestore/src/**/*.ts',
	// 		'packages/typestore/typings/browser.d.ts',
	// 		'typings/browser.d.ts',
	// 		// 'packages/*/src/**/*.ts',
	// 		'!packages/*/src/test/**/*.*'
	// 	])
	// 	.pipe(tsdoc({
	// 		module: 'commonjs',
	// 		target: 'es6',
	// 		includeDeclarations: false,
	// 		out: `${process.cwd()}/target/docs`,
	// 		name: 'TypeStore'
	//
	// 	}))

}

module.exports = gulp.task('docs',[],docs)
