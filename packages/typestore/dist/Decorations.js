"use strict";
require('reflect-metadata');
var Log = require('./log');
var Coordinator_1 = require('./Coordinator');
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
        //const type = Reflect.getOwnMetadata('design:type',constructor)
        var type = constructor;
        var attrs = Reflect.getOwnMetadata(Constants_1.TypeStoreAttrKey, constructor);
        var finalOpts = Object.assign({}, {
            clazzName: type.name,
            attrs: attrs
        }, opts);
        log.debug('Decorating: ', finalOpts.clazzName);
        Reflect.defineMetadata(Constants_1.TypeStoreModelKey, finalOpts, constructor);
        //if (Coordinator.getOptions().autoRegisterModels)
        Coordinator_1.Coordinator.registerModel(constructor);
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
        var attrType = Reflect.getMetadata('design:type', target, propertyKey);
        opts = Object.assign({}, {
            type: attrType,
            typeName: (attrType && attrType.name) ? attrType.name : 'unknown type',
            key: propertyKey
        }, opts);
        // Update the attribute array
        log.debug("Decorating " + propertyKey, opts);
        var modelAttrs = Reflect.getMetadata(Constants_1.TypeStoreAttrKey, target.constructor) || [];
        modelAttrs.push(opts);
        Reflect.defineMetadata(Constants_1.TypeStoreAttrKey, modelAttrs, target.constructor);
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
    if (opts === void 0) { opts = {}; }
    return function (constructor) {
        Reflect.defineMetadata(Constants_1.TypeStoreRepoKey, opts, constructor);
    };
}
exports.RepoDescriptor = RepoDescriptor;
/**
 * Describe a finder function that has to be implemented by the store
 *
 * @returns {function(any, string, TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any>}
 */
function FinderDescriptor(opts) {
    if (opts === void 0) { opts = {}; }
    return function (target, propertyKey, descriptor) {
        // Add the options to metadata
        Reflect.defineMetadata(Constants_1.TypeStoreFinderKey, opts, target, propertyKey);
        // Now add the finders to the repo metadata
        var finders = Reflect.getMetadata(Constants_1.TypeStoreFindersKey, target) || [];
        finders.push(propertyKey);
        Reflect.defineMetadata(Constants_1.TypeStoreFindersKey, finders, target);
        //return descriptor
    };
}
exports.FinderDescriptor = FinderDescriptor;

//# sourceMappingURL=Decorations.js.map
