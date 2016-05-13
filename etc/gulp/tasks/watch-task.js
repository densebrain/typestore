


function watchConfig(config) {
	const watcher = gulp.watch(config.srcs, [config.task])
	watcher.on('change', (event) => {
		log.info("Project",config.name,"Files Changed: ", event.path)
	})
	watcher.on('error', (event) => {
		log.error(`Received watcher error`,event,config)
		
	})
}

//noinspection JSUnusedLocalSymbols
/**
 * Gulp watch task, compiles on file change
 *
 * @param done
 */
function compileWatch(done) {
	log.info('TypeScript Compilation Watching Files...')
	
	
	runSequence(...compileTasks,() => {
		allWatchConfigs.forEach((config) => {
			watchConfig(config)
		})
	})
}

gulp.task('compile-watch',[],compileWatch)