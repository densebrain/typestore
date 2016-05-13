var path = require('path')
var packagesPath = path.resolve(__dirname,'../packages')
//var nodeModulesPath = path.resolve(__dirname,'../node_modules')
// Place the packages path 1st in main paths
//require.main.paths.unshift(nodeModulesPath)

global.addToNodePath = function(newPath) {
	//console.log(`Adding new node path ${newPath}`)
	require.main.paths.unshift(newPath)

	// Then use this module - probably can remove
	require('app-module-path').addPath(newPath)
	//require('app-module-path').addPath(nodeModulesPath)

	// Then add to env path for forks
	process.env.NODE_PATH += ":" + newPath

}

addToNodePath(packagesPath)

//console.log('Require main paths',require.main.paths)