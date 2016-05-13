
const makeTypeScriptConfig = require('../../tools/make-typescript-config')

gulp.task('tsconfig',[],() => {
	makeTypeScriptConfig(null,true)
})