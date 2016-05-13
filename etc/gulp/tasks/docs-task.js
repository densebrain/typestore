
/**
 * Run all compile tasks sequentially
 */
function docs() {
	return gulp
		.src([
			'packages/*/src/**/*.ts',
			'!packages/*/src/test/**/*.*'
		])
		.pipe(tsdoc({
			module: 'commonjs',
			target: 'es5',
			includeDeclarations: false,

			out: `${process.cwd()}/target/docs`,
			name: 'TypeStore',

			version:true
		}))

}

module.exports = gulp.task('docs',[],docs)
