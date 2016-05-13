require('shelljs/global')

const {readJSONFileSync} = require('../tools/helpers')
const {makeBabelConfig} = require('./babel-config')

const tsBaseConfig = readJSONFileSync(`${process.cwd()}/tsconfig.base.json`)
const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
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
	const projectConfig = projectConfigs[projectName]
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
			devDependencies: _.assign({},devDeps,basePackageJson.devDependencies),
			keywords: _.uniq(basePackageJson.keywords.concat(packageJson.keywords)),
			license: basePackageJson.license,
			author: basePackageJson.author,
			bugs: basePackageJson.bugs,
			repository: basePackageJson.repository,
			homepage: basePackageJson.homepage
		})

		_.defaultsDeep(packageJson,{
			main: "dist/index.js",
			typings: "dist/index.d.ts"

		})

		// Add core package dependencies
		if (!projectConfig.excludeCore) {
			packageJson.dependencies['typestore'] = nextMinorVersion
			if (!projectConfig.excludeMocks) {
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

	/**
	 * Create a TS config for this project
	 * using tsconfig.base.json, write it to disk
	 * append the latest compiler
	 * return
	 *
	 * @returns {{tsConfig,tsSettings,tsConfig}}
	 */
	function makeTypeScriptConfig() {
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
		})


		const tsConfigFile = project.base + "/tsconfig.json"
		log.info('Going to write ts config',tsConfigFile)
		fs.writeFileSync(tsConfigFile,JSON.stringify(tsConfig,null,4))

		const tsSettings = Object.assign({},tsConfig.compileOptions,{
			typescript: tsc
		})

		const tsProject = ts.createProject(tsConfigFile,tsSettings)

		return {
			tsConfig,
			tsSettings,
			tsProject
		}
	}

	// Grab the project for the compilation task
	const {tsProject} = makeTypeScriptConfig()
	const babelConfig = makeBabelConfig(project)

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
				.pipe(babel(babelConfig))
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