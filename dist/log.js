"use strict";
require('es6-shim');
var chalk = require('chalk');
/**
 * Enabled colored output
 *
 * @type {boolean}
 */
exports.colorEnabled = true;
var styles = {
    standard: {
        text: function (str) {
            return chalk.white(str);
        }
    },
    debug: {
        level: function (str) {
            return chalk.green(str);
        },
        name: function (str) {
            return chalk.white(str);
        }
    },
    info: {
        level: function (str) {
            return chalk.black.bgBlue.bold(str);
        },
        name: function (str) {
            return chalk.blue.bold(str);
        }
    },
    warn: {
        level: function (str) {
            return chalk.black.bgYellow.bold(str);
        },
        name: function (str) {
            return chalk.yellow.bold(str);
        }
    },
    error: {
        level: function (str) {
            return chalk.black.bgRed.bold(str);
        },
        name: function (str) {
            return chalk.red.bold(str);
        }
    }
};
/**
 * Current logger output
 */
var loggerOutput = console;
/**
 * Generic log action
 *
 * @param name
 * @param level
 * @param args
 */
function log(name, level) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var logOut = loggerOutput;
    var logFns = [logOut[level], logOut.log, logOut];
    var logFn = null;
    for (var _a = 0, logFns_1 = logFns; _a < logFns_1.length; _a++) {
        logFn = logFns_1[_a];
        if (logFn && typeof logFn === 'function')
            break;
    }
    if (!logFn)
        throw new Error('Logger output can not be null');
    var msg = (exports.colorEnabled) ?
        styles[level].name("[" + name + "] ") +
            styles[level].level("[" + level.toUpperCase() + "]") :
        "[" + name + "] [" + level.toUpperCase() + "]";
    if (exports.colorEnabled) {
    }
    logFn.apply(void 0, [msg].concat(args));
}
/**
 * Default log factory, uses console
 */
exports.DefaultLoggerFactory = {
    /**
     * Creates a simple logger, parsing
     * provided category as a simple filename
     * and using the current output for output
     *
     * @param name
     * @returns {ILogger}
     */
    create: function (name) {
        name = name.split('/').pop().split('.').shift();
        /**
         * (description)
         *
         * @param level (description)
         */
        var logger = {};
        // Create levels
        var levels = ['debug', 'info', 'warn', 'error'];
        levels.forEach(function (level) {
            /**
             * (description)
             *
             * @param args (description)
             */
            logger[level] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                log.apply(void 0, [name, level].concat(args));
            };
        });
        return logger;
    }
};
/**
 * Internal core logger factory
 */
var loggerFactory = exports.DefaultLoggerFactory;
/**
 * Change the internal default logger
 *
 * @export
 * @param newLoggerFactory new logger factory
 */
function setLoggerFactory(newLoggerFactory) {
    loggerFactory = newLoggerFactory;
}
exports.setLoggerFactory = setLoggerFactory;
function setLoggerOutput(newLoggerOutput) {
    loggerOutput = newLoggerOutput;
}
exports.setLoggerOutput = setLoggerOutput;
function create(name) {
    return loggerFactory.create(name);
}
exports.create = create;

//# sourceMappingURL=log.js.map
