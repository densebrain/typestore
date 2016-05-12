var path = require('path')
var packagesPath = path.resolve(__dirname,'../packages')

// Place the packages path 1st in main paths
require.main.paths.unshift(path.resolve(__dirname,'../packages'))

// Then use this module - probably can remove
require('app-module-path').addPath(packagesPath)

// Then add to env path for forks
process.env.NODE_PATH += ":" + packagesPath

//console.log('Require main paths',require.main.paths)