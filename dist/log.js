"use strict";
require('es6-shim');
/**
 * Current logger output
 */
var loggerOutput = console;
/**
 * Use internal node console by default
 */
function log(name, level) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (!loggerOutput[level])
        level = 'info';
    var msg = "[" + name + "] [" + level + "] " + args.shift();
    loggerOutput[level].apply(loggerOutput, [msg].concat(args));
}
/**
 * Default log factory, uses console
 */
exports.DefaultLoggerFactory = {
    create: function (name) {
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