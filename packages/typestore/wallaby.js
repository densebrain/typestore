module.exports = function (w) {

	return {
		files: [
			'typings/browser.d.ts',
			'src/**/*.ts',
			'test/fixtures/**/*.ts',
			{ pattern: 'src/test/**/*.spec.ts', ignore: true }

		],

		tests: [
			'src/test/**/*.spec.ts'
		],
		env: {
			type: 'node'
		}
		
	};
};
