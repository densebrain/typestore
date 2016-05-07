module.exports = function (w) {

	return {
		files: [
			'packages/*/typings/browser.d.ts',
			'packages/*/src/**/*.ts',
			'packages/*/test/fixtures/**/*.ts',
			{ pattern: 'packages/*/src/test/**/*.spec.ts', ignore: true }

		],

		tests: [
			'packages/*/src/test/**/*.spec.ts'
		],
		env: {
			type: 'node'
		}
		//,
		// compilers: {
		// 	'**/*.ts': w.compilers.typeScript({module: 'commonjs'})
		// }
	};
};
