require('shelljs/global')
require('./etc/packages-path')

const {readJSONFileSync} = require('./etc/gulp/helpers')
const semver = require('semver')
const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const del = require('del')
const ts = require('gulp-typescript')
const tsdoc = require('gulp-typedoc')
const dts = require('dts-bundle')
const babel = require('gulp-babel')
const mocha = require('gulp-mocha')
const merge = require('merge2')
const log = console
const _ = require('lodash')
const sourceMaps = require('gulp-sourcemaps')
const runSequence = require('run-sequence')

const git = require('gulp-git')
const ghRelease = require('gulp-github-release')

const SourceMapModes = {
	SourceMap: 1,
	InlineSourceMap: 2
}


// Set the sourcemap mode
const sourceMapMode = SourceMapModes.SourceMap
const compileTasks = []
const allWatchConfigs = []

// Config for release and versioning
const basePackageJson = readJSONFileSync('./package.json')
const nextMinorVersion = semver.inc(basePackageJson.version,'patch')
let updateBasePackageVersion = false
const releaseFiles = []
const releaseDir = `${process.cwd()}/target/releases`


/**
 * All project names current in system
 *
 * @type {string[]}
 */
const projectNames = [
	'typestore',
	'typestore-mocks',
	'typestore-plugin-dynamodb',
	'typestore-plugin-cloudsearch'
]

// Now map and configure all the projects/plugins
const projects = projectNames.map((projectName) => {
	const project = {
		name: projectName,
		base: path.resolve(__dirname,'packages',projectName),
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
		distPath = `${project.base}/src`,
		srcPath = `${project.base}/src`,
		testsPath = srcPath

	const targetDir = `${process.cwd()}/target/${projectName}`
	const srcs = project.srcs = _.uniq([
		`${process.cwd()}/typings/browser.d.ts`,
		`${process.cwd()}/packages/typestore/typings/typestore.d.ts`,
		`${project.base}/typings/browser.d.ts`,
		`${project.base}/typings/${project.name}.d.ts`,
		`${srcPath}/**/*.ts`,
		`${project.base}/test/**/*.ts`
	])

	const tests = project.tests = [
		`${testsPath}/**/*.spec.js`
	]

	const taskCompileName = project.tasks.compile
	const taskTestName = project.tasks.test
	
	const tsConfigPath = path.resolve(project.base,'tsconfig.json') 
	let tsProject = null

	let generatedConfig = false


	function init() {
		if (generatedConfig) {
			log.info(`Already generated on this run ${projectName} @ ${tsConfigPath}`)
			return
		}
		
		log.info(`Generating TS config for ${projectName} @ ${tsConfigPath}`)
		generatedConfig = true
		
		const tsBaseConfig = require('./tsconfig.json')
		Object.assign(tsBaseConfig,{
			rootDirs: projectNames.map(name => path.resolve(__dirname,'packages',name))
		})

		fs.writeFileSync(tsConfigPath,JSON.stringify(tsBaseConfig,null,4))
		tsProject = ts.createProject(tsConfigPath)
	}
	
	if (!fs.existsSync(tsConfigPath)) {
		log.info(`No TS config found @ ${tsConfigPath} - Generating`)
		init()
	} else {
		tsProject = ts.createProject(tsConfigPath)
	}
	
	
	


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

		if (projectName !== 'typestore') {
			packageJson.dependencies.typestore = nextMinorVersion
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
	
	
	/**
	 * Compile compile
	 * - the actual compilation
	 *
	 * @returns {*}
	 */
	function compile() {


		const sourcemapOpts = {
			sourceRoot: path.resolve(project.base, 'src'),
			includeContent: false
		}

		const tsResult = gulp.src(srcs)
			.pipe(sourceMaps.init())
			.pipe(ts(tsProject))

		log.info('Compilation Completed')

		const sourceMapHandler = (sourceMapMode === SourceMapModes.SourceMap) ?
			// External source maps
			sourceMaps.write('.', sourcemapOpts) :
			// Inline source maps
			sourceMaps.write(sourcemapOpts)

		return merge([
			tsResult.dts
				.pipe(gulp.dest(distPath)),
			tsResult.js
				.pipe(sourceMapHandler)
				.pipe(gulp.dest(distPath))
		])
	}

	gulp.task(project.tasks.init,[],init)
	gulp.task(taskCompileName,[project.tasks.init],compile)
	gulp.task(taskTestName,[taskCompileName],makeMochaTask(tests))
	gulp.task(project.tasks.release,[taskTestName],release)

	compileTasks.push(taskCompileName)
	allWatchConfigs.push({
		name: project.name,
		srcs: srcs,
		task: taskCompileName,
		base: project.base
	})

	return project
})


/**
 * Create a test task
 *
 * @param tests
 * @returns {function()}
 */
function makeMochaTask(tests = null) {
	return () => {
		if (!tests) {
			tests = []
			projects.forEach((project) => tests.push(...project.tests))
		}

		const reporter = (process.env.CIRCLE) ?
			'mocha-junit-reporter' :
			'spec'

		return gulp.src(tests)
			.pipe(mocha({reporter}))

	}
}


/**
 * Run all compile tasks sequentially
 */
function compileAll() {
	runSequence(compileTasks)
}

/**
 * Gulp watch task, compiles on file change
 *
 * @param done
 */
function watch(done) {
	log.info('TypeScript Compilation Watching Files...')

	runSequence(...compileTasks,() => {
		allWatchConfigs.forEach((config) => {
			const watcher = gulp.watch(config.srcs, [config.task])
			watcher.on('change', (event) => {
				log.info("Project",config.name,"Files Changed: ", event.path)
			})
		})
	})
}


/**
 * Clean task
 */
function clean() {
	return del(['target','packages/*/dist','packages/*/src/**/*.js','packages/*/src/**/*.map'])
}

/**
 * Push compiled release files to github
 *
 * @returns {*}
 */
function releaseAllPush() {
	if (releaseFiles.length < 1)
		throw new Error('No releases were created')


	basePackageJson.version = nextMinorVersion
	fs.writeFileSync(`${process.cwd()}/package.json`,JSON.stringify(basePackageJson,null,4))

	gulp.src('.')
		.pipe(git.add())
		.pipe(git.commit('[Release] Bumped version number'))

	return gulp.src(releaseFiles)
		.pipe(ghRelease({
			tag: `v${nextMinorVersion}`,
			name: `TypeStore Release ${nextMinorVersion}`,
			draft:false,
			prerelease:false,
			manifest:basePackageJson
		}))

}

/**
 * Release all task, sequentially calls
 * individual release tasks, after all are successful
 * it then runs release-push
 *
 * @param done
 */
function releaseAll(done) {
	const releaseTasks = projects.map((project) => project.tasks.release)
	runSequence(...releaseTasks,'release-all-push',done)

}

/**
 * Publish packages to NPM
 *
 * @param project
 */
function publish(project) {
	if (releaseFiles.length < 1)
		throw new Error('No releases were created')

	const baseUrl = "https://github.com/densebrain/typestore/releases/download"
	const releaseUrl = `${baseUrl}/v${nextMinorVersion}/${project.name}-${nextMinorVersion}.tar.gz`

	log.info(`Publishing ${project.name}@ ${nextMinorVersion} from ${releaseUrl}`)
	if (exec(`npm publish ${releaseUrl}`).code !== 0) {
		throw new Error(`Failed to publish ${project.name}`)
	}
}

/**
 * Publish each package to npm
 *
 * TODO: Update dist-tag after all artifacts are published successfully successful
 */
function publishAll() {
	projects.forEach(publish)
}


function docs() {
	return gulp
		.src([
			'packages/*/src/**/*.ts',
			'!packages/*/src/test/**/*.*'
		])
		.pipe(tsdoc({
			module: 'commonjs',
			target: 'es5',
			includeDeclarations: false,

			out: `${process.cwd()}/target/docs`,
			name: 'TypeStore',

			version:true
		}))

}


gulp.task('clean', [], clean)
gulp.task('compile-all', [], compileAll)
gulp.task('compile-watch',[],watch)
gulp.task('release-all',['clean'], releaseAll)
gulp.task('release-all-push',[],releaseAllPush)
gulp.task('publish-all',['release-all'],publishAll)
gulp.task('test-all',[],makeMochaTask())
gulp.task('docs',[],docs)

