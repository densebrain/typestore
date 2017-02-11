require("../global-env")

const
	{processDir,projectNames,_} = global,
	Fs = require('fs'),
	Path = require('path')

function compile(projectName, watch = false) {
	const
		projectDir = Path.resolve(processDir,'packages',projectName)
	
	echo(`Compiling: ${projectName} @ ${projectDir}`)
	//cd(projectDir)
	
	const
		cmd = `${processDir}/node_modules/.bin/tsc --project tsconfig.json`,
		cmdOpts = {
			cwd: projectDir
		}
	
	if (watch !== true) {
		if (exec(cmd,cmdOpts).code !== 0) {
			throw new Error(`Compilation failed (${projectName}) in: ${projectDir}`)
		}
		
		log.info('Compilation Completed')
	} else {
		echo(`Watching: ${projectName}`)
		
		_.assign(cmd,{
			async: true
		})
		
		exec(`${cmd} --watch`,cmdOpts,(code,stdout,stderr) => {
			echo(`Compilation exited: ${code}`)
		})
		
	}
}

projectNames.forEach(compile)

if (process.argv.includes('--watch')) {
	echo (`Watch Mode`)
	projectNames.forEach(name => compile(name,true))
}