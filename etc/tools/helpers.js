const fs = require('fs')

function readJSONFileSync(filename) {
	return JSON.parse(fs.readFileSync(filename,'utf-8'))
}

function writeJSONFileSync(filename,json) {
	fs.writeFileSync(filename,JSON.stringify(json,null,4))
}

module.exports = {
	readJSONFileSync,
	writeJSONFileSync
}
