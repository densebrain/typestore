//import 'es6-shim'


/**
 * Export fully configured promise for plugins specifically
 *
 * @type {"~bluebird/bluebird".Bluebird}
 */
import Promise = require('./Promise')


import * as Types from './Types'

import * as Messages from './Messages'

/**
 * Export all the decorations, etc
 */
import * as Decorations from './Decorations'

/**
 * Export constants
 */
import * as Constants from './Constants'

/**
 * Export log customization configuration
 */
import * as Log from './log'


import * as Errors from './Errors'

/**
 * Export the manager and manager functions
 */
export * from './Manager'

/**
 * Export all general types
 */
export {Types, Promise, Decorations, Constants, Log, Errors,Messages}


/**
 * Export the base Repo
 */
export {Repo} from './Repo'




