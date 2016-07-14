
/**
 * Run all compile tasks sequentially
 */
function compileAll(done) {
	runSequence(...compileTasks,done)
}

gulp.task('compile', ['tsconfig'], compileAll)
module.exports = gulp.task('compile-all', ['tsconfig','compile'], () => {})
