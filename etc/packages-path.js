var path = require('path')
var packagesPath = path.resolve(__dirname,'../packages')
require.main.paths.unshift(path.resolve(__dirname,'../packages'))
console.log('Require main paths',require.main.paths)
require('app-module-path').addPath(packagesPath)
process.env.NODE_PATH += ":" + packagesPath