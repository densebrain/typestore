require('shelljs/global')

const {readJSONFileSync} = require('./helpers')
const tsBaseConfig = readJSONFileSync(`${process.cwd()}/tsconfig.base.json`)
const path = require('path')
const gulp = require('gulp')
const fs = require('fs')
const log = console
const merge = require('merge2')
const ts = require('gulp-typescript')
const tsc= require('typescript')
const dts = require('dts-bundle')
const sourceMaps = require('gulp-sourcemaps')
const _ = require('lodash')

const SourceMapModes = {
	SourceMap: 1,
	InlineSourceMap: 2
}
const sourceMapMode = SourceMapModes.SourceMap

module.exports = function(projectName) {
	const project = {
		name: projectName,
		base: path.resolve(process.cwd(),'packages',projectName),
		tasks: {
			compile: `compile-${projectName}`,
			test: `test-${projectName}`,
			release: `release-${projectName}`,
			init: `init-${projectName}`
		}
	}

	/**
	 * Build the tasks
	 */
	const
		distPath = `${project.base}/dist`,
		srcPath = `${project.base}/src`,
		testsPath = distPath

	const targetDir = `${process.cwd()}/target/${projectName}`
	project.srcs = require('./project-srcs')(project,srcPath) 
		

	const tests = project.tests = [
		`${testsPath}/**/*.spec.js`
	]

	const taskCompileName = project.tasks.compile
	const taskTestName = project.tasks.test



	function release() {
		const releaseFile = `${releaseDir}/${projectName}-${nextMinorVersion}.tar.gz`
		releaseFiles.push(releaseFile)

		log.info(`Packaging ${projectName}`)
		rm('-Rf',targetDir)
		mkdir('-p',targetDir)
		mkdir('-p',releaseDir)
		cp('-Rf',`${project.base}/*`,targetDir)
		rm('-Rf',`${targetDir}/node_modules`)

		if (projectName === 'typestore')
			cp('./README.md',targetDir)

		const targetPackageJsonFile = `${targetDir}/package.json`
		const packageJson = readJSONFileSync(targetPackageJsonFile)
		const deps = packageJson.dependencies || {}
		const devDeps = packageJson.devDependencies || {}

		Object.assign(packageJson,{
			name: projectName,
			version: nextMinorVersion,
			dependencies: _.assign({},deps,basePackageJson.dependencies),
			devDependencies: _.assign({},devDeps,basePackageJson.devDependencies)
		})

		// Add core package dependencies
		if (projectName !== 'typestore') {
			packageJson.dependencies['typestore'] = nextMinorVersion
			if (projectName !== 'typestore-mocks') {
				packageJson.dependencies['typestore-mocks'] = nextMinorVersion
			}
		}

		log.info(`Writing package.json to ${targetPackageJsonFile}`)
		fs.writeFileSync(targetPackageJsonFile,JSON.stringify(packageJson,null,4))

		log.info(`Compressing to ${releaseFile}`)
		if (exec(`cd ${targetDir} && tar -cvzf ${releaseFile} .`).code !== 0) {
			throw new Error('Failed to compress archive')
		}

		log.info(`${projectName} is ready for release - publish-all will actually publish to npm`)
	}



	const tsConfig = _.cloneDeep(tsBaseConfig)
	const tsCompilerOptions = tsConfig.compilerOptions

	function makePackageDir(packageName,suffix) {
		return `${processDir}/packages/${packageName}/src/${suffix}`
	}

	_.assign(tsCompilerOptions,{
		baseUrl: project.base,
		paths: projectNames.reduce((projectPaths,name) => {
			return Object.assign(projectPaths, {
				[name]: [makePackageDir(name,'index')],
				[`${name}/*`]: [makePackageDir(name,'*')]
			})

		},{})
		// {
		// 	"typestore": [makePackageDir('typestore','index')],
		// 	"typestore/*": [makePackageDir('typestore','*')],
		// 	"typestore-mocks": [makePackageDir('typestore-mocks','index')],
		// 	"typestore-mocks/*": [makePackageDir('typestore-mocks','*')],
		// 	"typestore-plugin-dynamodb": ["../packages/typestore-plugin-dynamodb/src/index.js"],
		// 	"typestore-plugin-cloudsearch": ["../packages/typestore-plugin-cloudsearch/src/index"]
		//
		//
		// 	// "typestore": path.resolve(processDir,"packages/typestore/src/index"),
		// 	// "typestore/*": path.resolve(processDir,"packages/typestore/src/*")
		//
		// 	// "typestore-mocks": ["../packages/typestore-mocks/src/index"],
		// 	// "typestore-mocks/*": ["../packages/typestore-mocks/src/*"],
		// 	// "typestore-plugin-dynamodb": ["../packages/typestore-plugin-dynamodb/src/index.js"],
		// 	// "typestore-plugin-cloudsearch": ["../packages/typestore-plugin-cloudsearch/src/index"]
		// }
	})


	const tsConfigFile = project.base + "/tsconfig.json"
	log.info('Going to write ts config',tsConfigFile)
	fs.writeFileSync(tsConfigFile,JSON.stringify(tsConfig,null,4))

	const tsSettings = Object.assign({},tsConfig.compileOptions,{
		typescript: tsc,
		//target: "es5",//tsc.ScriptTarget.ES5,
		//module: "commonjs",//tsc.ModuleKind.CommonJS,
		//declaration: true,
		// preserveConstEnums: true,
		// "emitDecoratorMetadata": true,
		// "experimentalDecorators": true,
		// "allowSyntheticDefaultImports": true
	})

	const tsProject = ts.createProject(tsConfigFile,tsSettings)

	/**
	 * Compile compile
	 * - the actual compilation
	 *
	 * @returns {*}
	 */
	const compile = () => {
		process.chdir(project.base)

		const sourcemapOpts = {
			sourceRoot: path.resolve(project.base, 'src'),
			includeContent: false
		}


		const tsResult = gulp.src(project.srcs)
			.pipe(sourceMaps.init())
			//.pipe(ts(tsSettings))
			.pipe(ts(tsProject))



		const sourceMapHandler = (sourceMapMode === SourceMapModes.SourceMap) ?
			// External source maps
			sourceMaps.write('.', sourcemapOpts) :
			// Inline source maps
			sourceMaps.write(sourcemapOpts)

		const finalMerge = merge([
			tsResult.dts
				.pipe(gulp.dest(distPath)),
			tsResult.js
				.pipe(sourceMapHandler)
				.pipe(gulp.dest(distPath))
		])

		log.info('Compilation Completed')

		return finalMerge
	}

	gulp.task(taskCompileName,[],compile)
	gulp.task(taskTestName,[taskCompileName],require('./test-task')(tests))
	gulp.task(project.tasks.release,[taskTestName],release)

	compileTasks.push(taskCompileName)
	allWatchConfigs.push({
		name: project.name,
		srcs: project.srcs,
		task: taskCompileName,
		base: project.base
	})

	return project
}