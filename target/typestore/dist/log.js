"use strict";

var chalk = require('chalk');
/**
 * Log level values
 */
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
})(exports.LogLevel || (exports.LogLevel = {}));
var LogLevel = exports.LogLevel;
/**
 * Enabled colored output
 *
 * @type {boolean}
 */
exports.colorEnabled = true;
var styles = {
    standard: {
        text: function text(str) {
            return chalk.white(str);
        }
    },
    debug: {
        level: function level(str) {
            return chalk.green(str);
        },
        name: function name(str) {
            return chalk.white(str);
        }
    },
    info: {
        level: function level(str) {
            return chalk.black.bgBlue.bold(str);
        },
        name: function name(str) {
            return chalk.blue.bold(str);
        }
    },
    warn: {
        level: function level(str) {
            return chalk.black.bgYellow.bold(str);
        },
        name: function name(str) {
            return chalk.yellow.bold(str);
        }
    },
    error: {
        level: function level(str) {
            return chalk.black.bgRed.bold(str);
        },
        name: function name(str) {
            return chalk.red.bold(str);
        }
    }
};
var logThreshold = LogLevel.DEBUG;
function setLogThreshold(level) {
    logThreshold = level;
}
exports.setLogThreshold = setLogThreshold;
/**
 * Current logger output
 */
var loggerOutput = console;
function parseLogLevel(level) {
    var logLevel = LogLevel.DEBUG;
    try {
        logLevel = LogLevel[level.toUpperCase()];
    } catch (err) {
        console.warn("Failed to parse log level " + level, err);
        logLevel = LogLevel.DEBUG;
    }
    return logLevel;
}
/**
 * Generic log action
 *
 * @param name
 * @param level
 * @param args
 */
function log(name, level) {
    if (parseLogLevel(level) < logThreshold) return;
    var logOut = loggerOutput;
    var logFns = [logOut[level], logOut.log, logOut];
    var logFn = null;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = logFns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            logFn = _step.value;

            if (logFn && typeof logFn === 'function') break;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    if (!logFn) throw new Error('Logger output can not be null');
    var msg = exports.colorEnabled ? styles[level].name("[" + name + "] ") + styles[level].level("[" + level.toUpperCase() + "]") : "[" + name + "] [" + level.toUpperCase() + "]";

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
    }

    logFn.apply(undefined, [msg].concat(args));
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

    create: function create(name) {
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
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                log.apply(undefined, [name, level].concat(args));
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
