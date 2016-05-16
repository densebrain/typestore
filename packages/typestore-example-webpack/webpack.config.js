
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
	context: __dirname + '/src',
	entry: {
		"example-webpack": "./index"
	},

	output: {
		path: __dirname + '/dist',
		filename: 'bundle.js'
	},
	
	// Currently we need to add '.ts' to the resolve.extensions array.
	resolve: {
		alias: {
			assert: 'browser-assert'
		},
		modules: [
			path.resolve(__dirname,'..'),
			path.resolve(__dirname,'node_modules'),
			path.resolve(__dirname,'../../node_modules')
		],
		extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
	},

	// Source maps support ('inline-source-map' also works)
	devtool: 'inline-source-map',

	// Add the loader for .ts files.
	module: {
		preLoaders: [
			{
				test: /\.(tsx?|js)$/,
				exclude: /(node_modules)/,
				loader: 'source-map-loader'
			}
		],
		loaders: [
			{
				test: /\.json$/,
				loader: 'json'
			},
			{
				test: /\.ts$/,
				loader: 'awesome-typescript-loader?useBabel=true&useCache=true'
			}
		]
	},

	plugins: [
		new ForkCheckerPlugin(),
		new HtmlWebpackPlugin({
			template: './index.html'
		})

	]
};