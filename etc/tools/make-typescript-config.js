const fs = require('fs')
const makeSrcGlobs = require('./project-srcs')
const tsBaseConfig = readJSONFileSync(`${processDir}/etc/tsconfig.base.json`)
const path = require('path')

/**
 * Create a TS config for this project
 * using tsconfig.base.json, write it to disk
 * append the latest compiler
 * return
 *
 * @returns {{tsConfig,tsSettings,tsConfig}}
 */
function makeTypeScriptConfig(project,isGlobalConfig = false) {
	const tsConfig = _.cloneDeep(tsBaseConfig)
	const tsCompilerOptions = tsConfig.compilerOptions

	const configBaseDir = (isGlobalConfig) ?
		processDir:
		project.base

	function makePackageDir(packageName,suffix) {
		return `${processDir}/packages/${packageName}/src/${suffix}`
	}



	_.assign(tsCompilerOptions,{
		baseUrl: path.resolve(configBaseDir,'src'),
		paths: projectNames.reduce((projectPaths,name) => {
			return Object.assign(projectPaths, {
				[name]: [makePackageDir(name,'index')],
				[`${name}/*`]: [makePackageDir(name,'*')]
			})
		},{})
	})

	if (isGlobalConfig) {
		const globalSrcs = tsConfig.filesGlob = makeSrcGlobs(null,null,true)

		// tsConfig.files = globalSrcs.reduce((allFiles,pattern) => {
		// 	return allFiles.concat(glob.sync(pattern))
		// },[])

		log.info('Global src list',globalSrcs,tsConfig.files)
	}

	const tsConfigFile = configBaseDir + "/tsconfig.json"
	log.info('Going to write ts config',tsConfigFile)
	writeJSONFileSync(tsConfigFile,tsConfig)

	const tsSettings = Object.assign({},tsConfig.compileOptions,{
		typescript: tsc
	})



	return {
		tsConfig,
		tsSettings,
		tsConfigFile
	}
}


module.exports = makeTypeScriptConfig