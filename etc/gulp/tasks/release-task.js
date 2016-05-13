

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
		.pipe(git.commit(`[Release] Release Push ${nextMinorVersion}`))

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

gulp.task('release-all',[], releaseAll)
gulp.task('release-all-push',[],releaseAllPush)