const fs = require('fs')

function readJSONFileSync(filename) {
	return JSON.parse(fs.readFileSync(filename,'utf-8'))
}

module.exports = {
	readJSONFileSync
}
