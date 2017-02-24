require("../global-env")

const
	{project,processDir,projectNames,projectConfigs,nextMinorVersion,_,tsc,readJSONFileSync,writeJSONFileSync} = global,
	Fs = require('fs'),
	Path = require('path')

function updateVersion(projectName) {
	
	const
		pkgFile = Path.resolve(processDir,'packages',projectName,'package.json'),
		pkg = readJSONFileSync(pkgFile)
	
	pkg.version = nextMinorVersion
	
	echo(`Version ${pkgFile} to ${nextMinorVersion}`)
	writeJSONFileSync(pkgFile,pkg)
}

projectNames.forEach(updateVersion)

if (exec(`git commit -a -m "Bumped version to ${nextMinorVersion}"`).code !== 0) {
	throw new Error(`Failed to commit version bump`)
}


function publish(projectName) {
	const
		projectDir = Path.resolve(processDir,'packages',projectName)
	
	echo(`Publishing: ${projectName}`)
	
	if (exec(`npm publish`,{cwd: projectDir}).code !== 0) {
		throw new Error(`Failed to publish: ${projectName}`)
	}
}

projectNames.forEach(publish)
//npm version patch && git push --tags
