
const mocha = require('gulp-mocha')
const gulp = require('gulp')
/**
 * Create a test task
 *
 * @param tests
 * @returns {function()}
 */
function makeMochaTask(tests = null) {
	return () => {
		require('../packages-path')
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

module.exports = makeMochaTask