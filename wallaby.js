
//require('./etc/packages-path')

var
	path = require('path'),
	projectRoot = path.resolve(__dirname),
	_ = require('lodash'),
	nodeModuleRelativePaths = require('glob').sync('packages/*/node_modules'),
	
	nodeModulePaths = _.map(nodeModuleRelativePaths,function(modPath) {
		return path.resolve('.',modPath)
	}),
	
	nodePath = (process.env.NODE_PATH || "") + ':' + nodeModulePaths.join(':')


//var tsConfig = require('./tsconfig.json').compilerOptions
//console.log('Using runner node path\n',nodeModulePaths,'\n',nodePath)
// nodeModulePaths.forEach(function(newPath) {
// 	addToNodePath(newPath)
// })

module.exports = function (wallaby) {

	return {
		projectRoot: projectRoot,

		/**
		 * Regular modules
		 */
		files: [
			'!typings/browser.d.ts',
			'packages/*/src/**/*.ts',
			'!packages/*/src/**/*.d.ts',
			'!packages/*/src/test/**/*.spec.ts',
			{ pattern: 'packages/*/src/test/fixtures/*.ts', instrument:false }
		],


		/**
		 * Tests
		 */
		tests: [
			'packages/*/src/test/**/*.spec.ts'
		],

		// Mocha
		testFramework: "mocha",

		env: {
			type: 'node',
			params: {
				env:'DEBUG=true;NODE_PATH=' + nodePath
			}
		},

		// In order to get everything to work it has to
		// go through babel - this needs to be fixed at some-point
		compilers: {
			'**/*.ts': wallaby.compilers.typeScript({
				typescript: require('typescript')
				// module: 5,  // ES6
				// target: 2,  // ES6
				// emitDecoratorMetadata: true,
				// experimentalDecorators: true,
				// preserveConstEnums: true,
				// allowSyntheticDefaultImports: true
			})
		},
		// preprocessors: {
		// 	'**/*.js': file => {
		// 		return require('babel-core').transform(file.content,{
		// 			sourceMap: true,
		// 			presets: ['es2015','stage-0']
		// 		})
		// 	}
		// },

		delays: {
			edit: 500,
			run: 150
		},

		workers: {
			initial: 1,
			regular: 1
		},

		// Override the global Promise
		bootstrap: function() {
			var
				path = require('path'),
				mochaPath = path.resolve(wallaby.localProjectDir,'./etc/mocha/mocha-setup')
			
			//console.log('mocha path', mochaPath)
			global.assert = require('assert')
			require(mochaPath)





		}
	};
};