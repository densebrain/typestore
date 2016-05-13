
/**
 * Run all compile tasks sequentially
 */
function compileAll(done) {
	runSequence(...compileTasks,done)
}

module.exports = gulp.task('compile-all', [], compileAll)
