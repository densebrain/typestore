require("../global-env")

const
	{project,processDir,projectNames,projectConfigs,_,tsc,readJSONFileSync,writeJSONFileSync} = global,
	Fs = require('fs'),
	Path = require('path'),
	makeSrcGlobs = require('../tools/project-srcs'),
	tsBaseConfig = readJSONFileSync(`${processDir}/etc/tsconfig.base.json`)


function makePackageDir(isGlobalConfig,packageName,suffix) {
	const
		basePackageDir = isGlobalConfig ? `./packages/` : `../../`
	
	return `${basePackageDir}${packageName}/src/${suffix}`
}

/**
 * Create a TS config for this project
 * using tsconfig.base.json, write it to disk
 * append the latest compiler
 * return
 *
 * @returns {{tsConfig,tsSettings,tsConfig}}
 */
function configProject(projectName,isGlobalConfig = false) {
	const
		tsConfig = _.cloneDeep(tsBaseConfig),
		tsCompilerOptions = tsConfig.compilerOptions,
		
		configBaseDir = (isGlobalConfig) ?
			processDir :
			Path.resolve(processDir,'packages',projectName),
		
		//baseUrl = Path.resolve(isGlobalConfig ? `./packages/typestore` : configBaseDir,'src'),
		//outDir = Path.resolve(processDir,`dist${project ? '/' + project.name : ''}`)
		//Path.resolve(processDir,`dist${project ? '/' + project.name : ''}`)
		baseUrl = isGlobalConfig ? `./packages/typestore/src` : './src',
		outDir = isGlobalConfig ? `./packages/typestore/dist` : './dist'
	
	
	
	_.assign(tsCompilerOptions,
		{
			baseUrl,
			outDir
		},
		isGlobalConfig && {
			paths: projectNames.reduce((projectPaths, name) => {
				return Object.assign(projectPaths, {
					[name]: [makePackageDir(isGlobalConfig, name, 'index')],
					[`${name}/*`]: [makePackageDir(isGlobalConfig, name, '*')]
				})
			}, {})
		})
	
	const
		tsConfigFile = configBaseDir + "/tsconfig.json"
	
	log.info('Going to write ts config',tsConfigFile)
	writeJSONFileSync(tsConfigFile,tsConfig)
	
	const
		tsSettings = Object.assign({},tsConfig.compileOptions,{
			typescript: tsc
		}),
		nodeModuleDir = `${processDir}/node_modules/${projectName}`
	
	echo(`Linking: ${configBaseDir} to ${nodeModuleDir}`)
	rm('-Rf',nodeModuleDir)
	ln('-fs',configBaseDir,nodeModuleDir)
	return {
		tsConfig,
		tsSettings,
		tsConfigFile
	}
}


configProject(null,true)

projectNames.forEach(name => {
	echo(`Configuring project: ${name}`)
	configProject(name,false)
})