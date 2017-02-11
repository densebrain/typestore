require("../global-env")

const
	Path = require('path'),
	Fs = require('fs'),
	{projectNames} = global,
	baseDir = process.cwd(),
	distDirs = [baseDir,...projectNames.map(name => Path.resolve(baseDir,'packages',name))].map(dir => Path.resolve(dir,'dist'))

echo(`Removing Directories: \n${distDirs.join('\n')}`)

if (rm('-Rf',...distDirs).code !== 0) {
	echo(`Failed to clean directories`)
} else {
	echo(`Cleaned all directories`)
}
