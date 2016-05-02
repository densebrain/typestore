
import 'es6-shim'

/**
 * Logger interface
 * 
 * @export
 * @interface ILogger
 */
export interface ILogger {
	debug:(...args) => void
	info:(...args) => void
	warn:(...args) => void
	error:(...args) => void
}


/**
 * Create logger instances for output
 * 
 * @export
 * @interface ILoggerFactory
 */
export interface ILoggerFactory {
	/**
	 * Return a new logger for the supplied
	 * name/category
	 * 
	 * @param {string} name (description)
	 * @returns {ILogger} (description)
	 */
	create(name:string):ILogger
}


/**
 * Current logger output
 */
let loggerOutput:ILogger = console

/**
 * Use internal node console by default
 */
function log(name,level, ...args) {
	if (!loggerOutput[level])
		level = 'info'
	
	const msg = `[${name}] [${level}] ${args.shift()}`	
	loggerOutput[level](msg,...args);
}

/**
 * Default log factory, uses console
 */
export const DefaultLoggerFactory = {
	
	create(name:string):ILogger {
		
		
		
		
		/**
		 * (description)
		 * 
		 * @param level (description)
		 */
		const logger = {}
		
		// Create levels
		const levels = ['debug','info','warn','error']
		levels.forEach((level) => {
			/**
			 * (description)
			 * 
			 * @param args (description)
			 */
			logger[level] = (...args) => {
				log(name,level,...args)
			}
		})
		
		return logger as ILogger
		
	}
}

/**
 * Internal core logger factory
 */
let loggerFactory:ILoggerFactory = DefaultLoggerFactory

/**
 * Change the internal default logger
 * 
 * @export
 * @param newLoggerFactory new logger factory
 */
export function setLoggerFactory(newLoggerFactory:ILoggerFactory) {
	loggerFactory = newLoggerFactory
}

export function setLoggerOutput(newLoggerOutput:ILogger) {
	loggerOutput = newLoggerOutput
}

 export function create(name:string) {
	 return loggerFactory.create(name)
 }