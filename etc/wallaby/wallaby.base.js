
var path = require('path')
var projectRoot = path.resolve(__dirname,'../..')

module.exports = function (wallaby) {




	return {
		projectRoot: projectRoot,
		
		/**
		 * Regular modules
		 */
		files: [
			'typings/browser.d.ts',
			'src/**/*.ts',
			'!src/test/**/*.spec.ts',
			{ pattern: 'src/test/fixtures/*.ts', instrument:false }
		],


		/**
		 * Tests
		 */
		tests: [
			'src/test/**/*.spec.ts'
		],

		// Mocha
		testFramework: "mocha",

		env: {
			type: 'node'
		},

		// In order to get everything to work it has to
		// go through babel - this needs to be fixed at somepont
		compilers: {
			'**/*.ts': wallaby.compilers.typeScript({
				module: 5,  // ES6
				target: 2  // ES6
			})
		},
		preprocessors: {
			'**/*.js': file => require('babel-core').transform(
				file.content,
				{sourceMap: true, presets: ['es2015']})
		},

		delays: {
			edit: 500,
			run: 150
		},

		// Override the global Promise
		bootstrap: function() {
			var path = require('path')
			var mochaPath = path.resolve(wallaby.localProjectDir,'../../etc/mocha/mocha-setup')
			console.log('mocha path', mochaPath)
			require(mochaPath)

			

		}
	};
};