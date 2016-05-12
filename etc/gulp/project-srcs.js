const _ = require('lodash')

module.exports = function(project,srcPath) {
	return _.uniq([
		`${process.cwd()}/typings/browser.d.ts`,
		//`${process.cwd()}/typings/bluebird-promise.d.ts`,
		`${process.cwd()}/packages/typestore/src/Globals.ts`,
		//`${processDir}/typings/browser/definitions/es6-promise/index.d.ts`,

		`${process.cwd()}/packages/typestore/typings/typestore.d.ts`,
		`${project.base}/typings/browser.d.ts`,
		`${project.base}/typings/${project.name}.d.ts`,
		`${srcPath}/**/*.ts`,
		`!${srcPath}/**/*.d.ts`,
		`${project.base}/test/**/*.ts`
	])
}