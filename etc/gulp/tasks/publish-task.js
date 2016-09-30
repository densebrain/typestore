
const
	{releaseFiles,log,nextMinorVersion,gulp} = global

/**
 * Publish packages to NPM
 *
 * @param project
 */
function publish(project) {
	if (releaseFiles.length < 1)
		throw new Error('No releases were created')

	const
		baseUrl = "https://github.com/densebrain/typestore/releases/download",
		releaseUrl = `${baseUrl}/v${nextMinorVersion}/${project.name}-${nextMinorVersion}.tar.gz`

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

module.exports = gulp.task('publish-all',['release-all'],publishAll)