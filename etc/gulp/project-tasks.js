


const
	path = require('path'),
	babel = require('gulp-babel'),
	fs = require('fs'),
	merge = require('merge2'),
	sourceMaps = require('gulp-sourcemaps'),

	makeSrcGlobs = require('../tools/project-srcs'),
	makeTypeScriptConfig = require('../tools/make-typescript-config'),
	{makeBabelConfig} = require('./babel-config'),
	makeMochaTask = require('./tasks/test-task')

const SourceMapModes = {
	SourceMap: 1,
	InlineSourceMap: 2
}
const sourceMapMode = SourceMapModes.InlineSourceMap

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
	project.srcs = makeSrcGlobs(project,srcPath)


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

		// if (projectName === 'typestore')
		// 	cp('./README.md',targetDir)

		const targetPackageJsonFile = `${targetDir}/package.json`
		const packageJson = readJSONFileSync(targetPackageJsonFile)
		const deps = packageJson.dependencies || {}
		const devDeps = packageJson.devDependencies || {}

		Object.assign(packageJson,{
			name: projectName,
			version: nextMinorVersion,
			dependencies: _.assign({},deps,basePackageJson.dependencies),
			devDependencies: _.assign({},devDeps,basePackageJson.devDependencies),
			keywords: _.uniq((basePackageJson.keywords || [])
				.concat(packageJson.keywords)),
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

		// Any inter-project dependencies are added
		(projectConfigs[projectName].internalDependencies || [])
			.forEach(name => packageJson.dependencies[name] = nextMinorVersion)


		log.info(`Writing package.json to ${targetPackageJsonFile}`)
		fs.writeFileSync(targetPackageJsonFile,JSON.stringify(packageJson,null,4))

		log.info(`Compressing to ${releaseFile}`)
		if (exec(`cd ${targetDir} && tar -cvzf ${releaseFile} .`).code !== 0) {
			throw new Error('Failed to compress archive')
		}

		log.info(`${projectName} is ready for release - publish-all will actually publish to npm`)
	}


	// Grab the project for the compilation task
	// const {tsConfigFile,tsSettings} = makeTypeScriptConfig(project)
	// const tsProject = ts.createProject(tsConfigFile,tsSettings)
	// const babelConfig = makeBabelConfig(project)

	/**
	 * Compile compile
	 * - the actual compilation
	 *
	 * @returns {*}
	 */
	const compile = () => {
		process.chdir(project.base)
		
		log.info(`Compiling in: ${project.base}`)
		if (exec('../../node_modules/.bin/tsc --project tsconfig.json').code !== 0) {
			throw new Error(`Compilation failed in: ${project.base}`)
		}
		
		log.info('Compilation Completed')

	}

	gulp.task(taskCompileName,[],compile)
	gulp.task(taskTestName,[taskCompileName],makeMochaTask(tests))
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
