
require('fs')
	.readdirSync(__dirname)
	.filter(filename => filename.indexOf('index') === -1)
	.forEach(filename => {
		console.log(`loading task file ${filename}`)
		require(`./${filename.replace(/\.js$/g,'')}`)
	})