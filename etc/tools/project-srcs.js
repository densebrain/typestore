
module.exports = function(project,srcPath,isGlobalConfig=false) {
	const basePaths = [
		`${processDir}/typings/browser.d.ts`,
		`${processDir}/packages/typestore/typings/typestore.d.ts`
	]
	
	return _.uniq(
		basePaths.concat(
			(isGlobalConfig) ? [
				`${processDir}/packages/*/src/**/*.ts`,
				`!${processDir}/packages/*/src/**/*.d.ts`	
			] :
			[
				`${project.base}/typings/browser.d.ts`,
				`${project.base}/typings/${project.name}.d.ts`,
				`${srcPath}/**/*.ts`,
				`!${srcPath}/**/*.d.ts`
			]
		)
	)
}