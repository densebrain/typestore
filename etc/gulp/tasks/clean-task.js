

/**
 * Clean task
 */
function clean() {
	return del([
		'target',
		'tsconfig.json',
		'packages/*/dist',
		'packages/*/tsconfig.json',
		'packages/*/src/**/*.js',
		'packages/*/src/**/*.map',
		'packages/*/src/**/*.d.ts'
	])
}





gulp.task('clean', [], clean)
