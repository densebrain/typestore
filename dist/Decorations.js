"use strict";
require('reflect-metadata');
var _ = require('lodash');
var Log = require('./log');
var Manager_1 = require('./Manager');
var Constants_1 = require("./Constants");
var log = Log.create(__filename);
/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 *
 * @param {opts:IModelOptions} Options for this model generation
 */
function ModelDescriptor(opts) {
    return function (constructor) {
        // Make sure everything is valid
        _.defaults(opts, {
            clazzName: constructor.name
        });
        log.debug('Decorating: ', opts.clazzName);
        Manager_1.Manager.registerModel(opts.clazzName, constructor, opts);
    };
}
exports.ModelDescriptor = ModelDescriptor;
/**
 * Decorator model attribute
 * @param opts
 * @returns {function(any, string): undefined}
 * @constructor
 */
function AttributeDescriptor(opts) {
    return function (target, propertyKey) {
        Manager_1.Manager.registerAttribute(target, propertyKey, opts);
    };
}
exports.AttributeDescriptor = AttributeDescriptor;
/**
 * Decorate the repo for a given model
 *
 * @param opts for the repository
 * @return {function(Function)}
 */
function RepoDescriptor(opts) {
    return function (constructor) {
    };
}
exports.RepoDescriptor = RepoDescriptor;
/**
 * Describe a finder function that has to be implemented by the store
 *
 * @returns {function(any, string, TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any>}
 */
function FinderDescriptor() {
    return function (target, propertyKey, descriptor) {
        // Now add the finders to the repo metadata
        var finders = Reflect.getMetadata(Constants_1.DynoFindersKey, target) || [];
        finders.push(propertyKey);
        Reflect.defineMetadata(Constants_1.DynoFindersKey, finders, target);
        //return descriptor
    };
}
exports.FinderDescriptor = FinderDescriptor;

//# sourceMappingURL=Decorations.js.map
