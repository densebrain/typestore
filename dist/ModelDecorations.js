"use strict";
require('reflect-metadata');
var _ = require('lodash');
var Log = require('./log');
var Manager_1 = require('./Manager');
var log = Log.create('ModelDecorations');
/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 */
function ModelDescriptor(opts) {
    if (!process.env.DYNO_SKIP) {
        return function (constructor) {
            // Make sure everything is valid
            _.defaults(opts, {
                clazzName: constructor.name
            });
            log.debug('Decorating: ', opts.clazzName);
            Manager_1.Manager.registerModel(opts.clazzName, constructor, opts);
        };
    }
}
exports.ModelDescriptor = ModelDescriptor;
function AttributeDescriptor(opts) {
    return function (target, propertyKey) {
        Manager_1.Manager.registerAttribute(target, propertyKey, opts);
    };
}
exports.AttributeDescriptor = AttributeDescriptor;

//# sourceMappingURL=ModelDecorations.js.map
