//import 'es6-shim'
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/**
 * Export fully configured promise for plugins specifically
 *
 * @type {"~bluebird/bluebird".Bluebird}
 */
var Promise = require('./Promise');
exports.Promise = Promise;
/**
 * Export types as a a namespace and export all
 * exports directly as well
 */
var Types = require('./Types');
exports.Types = Types;
var Messages = require('./Messages');
exports.Messages = Messages;
/**
 * Export all the decorations, etc
 */
var Decorations = require('./Decorations');
exports.Decorations = Decorations;
/**
 * Export constants
 */
var Constants = require('./Constants');
exports.Constants = Constants;
/**
 * Export log customization configuration
 */
var Log = require('./log');
exports.Log = Log;
var Errors = require('./Errors');
exports.Errors = Errors;
/**
 * Export the manager and manager functions
 */
__export(require('./Manager'));
/**
 * Export all general types
 */
/**
 * Export the base Repo
 */
__export(require('./Repo'));
__export(require('./Types'));
__export(require('./Decorations'));

//# sourceMappingURL=index.js.map
