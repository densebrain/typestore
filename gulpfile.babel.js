require('source-map-support').install()
require('shelljs/global')
//require('./etc/packages-path')
// exec(`rm -Rf node_modules/gulp-typescript/node_modules/typescript &&
// ln -s ${process.cwd()}/node_modules/typescript node_modules/gulp-typescript/node_modules/typescript`)

const {readJSONFileSync} = require('./etc/tools/helpers')
const 
	semver = require('semver'),
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	del = require('del'),
	tsdoc = require('gulp-typedoc'),
	log = console,
	runSequence = require('run-sequence'),
	git = require('gulp-git'),
	ghRelease = require('gulp-github-release'),
	projectConfigs = require('./etc/projects.json'),
	projectNames = Object.keys(projectConfigs)

Object.assign(global,{
	processDir: process.cwd(),
	basePackageJson: readJSONFileSync('./package.json')
})

// Config for release and versioning
Object.assign(global,{
	nextMinorVersion: semver.inc(basePackageJson.version,'patch'),
	releaseFiles: [],
	compileTasks:[],
	allWatchConfigs:[],
	releaseDir: `${process.cwd()}/target/releases`,
	projectConfigs,
	projectNames
})


// Now map and configure all the projects/plugins
global.projects = projectNames.map(require('./etc/gulp/project-tasks'))


/**
 * Load auxillary tasks
 */

require('./etc/gulp/tasks')

/**
 * Run all compile tasks sequentially
 */
function compileAll(done) {
	runSequence(...compileTasks,done)
}

//noinspection JSUnusedLocalSymbols
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
	return del([
		'target',
		'packages/*/dist',
		'packages/*/tsconfig.json',
		'packages/*/src/**/*.js',
		'packages/*/src/**/*.map',
		'packages/*/src/**/*.d.ts'
	])
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
gulp.task('release-all',[], releaseAll)
gulp.task('release-all-push',[],releaseAllPush)
gulp.task('publish-all',['release-all'],publishAll)
gulp.task('test-all',[],require('./etc/gulp/test-task')())
gulp.task('docs',[],docs)

