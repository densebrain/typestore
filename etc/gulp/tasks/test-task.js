
const mocha = require('gulp-mocha')

/**
 * Create a test task
 *
 * @param tests
 * @returns {function()}
 */
function makeMochaTask(tests = null) {
	return () => {
		require('../../packages-path')
		require('../../mocha/mocha-setup')
		if (!tests) {
			tests = []
			projects.forEach((project) => tests.push(...project.tests))
		}

		const reporter = (process.env.CIRCLE) ?
			'mocha-junit-reporter' :
			'spec'

		return gulp.src(tests)
			.pipe(mocha({reporter}))

	}
}

/**
 * Create 'test-all'
 */
gulp.task('test-all',[],makeMochaTask())

/**
 * Export task creator for individual test tasks
 *
 * @type {makeMochaTask}
 */
module.exports = makeMochaTask