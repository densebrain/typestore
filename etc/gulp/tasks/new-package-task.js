const gulp = require('gulp')
const inquirer = require('inquirer')
const newPackage = require('../../tools/new-package')


const questions = [
	{
		type: 'input',
		name: 'name',
		message: 'New package name? i.e. typestore-plugin-coolboard - if you get the ref - hi five!',
		validate(newName) {
			return (/[A-Za-z0-9_-]/.test(newName)) ?
				true :
				"Name must be alphanumeric, -_ are acceptable"
		}
	},
	{
		type: 'list',
		name: 'type',
		message: 'Is the runtime node or browser',
		choices: ['node','browser']
	},
	{
		type: 'input',
		message: 'A quick - hopefully glib description',
		name: 'description'
	}
]

/**
 * Gulp task that walks user thru
 * creating a new package
 */

gulp.task('new-package',[],(done) => {
	
	inquirer
		.prompt(questions)
		.then((answers) => {
			
			// Now create a new package with the answers
			newPackage(answers.name,{
				type: answers.type,
				description: answers.description
			})
		})
		.then(done)
		.catch(done)
		
})