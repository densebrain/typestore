"use strict";

require('reflect-metadata');
var Constants_1 = require("./Constants");
var log = require('./log').create(__filename);
/**
 * Simple pass thru to define metadata
 *
 * @param metadataKey
 * @param metadata
 * @param target
 * @param targetKey
 */
function setMetadata(metadataKey, metadata, target, targetKey) {
    Reflect.defineMetadata(metadataKey, metadata, target, targetKey);
}
exports.setMetadata = setMetadata;
/**
 * Get metadata
 *
 * @param metadataKey
 * @param target
 * @param targetKey
 * @returns {any}
 */
function getMetadata(metadataKey, target, targetKey) {
    return Reflect.getMetadata(metadataKey, target, targetKey);
}
exports.getMetadata = getMetadata;
function makeMetadataGetter(metadataKey) {
    return function (target, targetKey) {
        return Reflect.getMetadata(metadataKey, target, targetKey);
    };
}
exports.makeMetadataGetter = makeMetadataGetter;
exports.getMetadataReturnType = makeMetadataGetter(Constants_1.ReturnTypeKey);
exports.getMetadataType = makeMetadataGetter(Constants_1.TypeKey);
/**
 * Create a simple options decorator for things like finders
 *
 * @param metadataKey
 * @param includeTargetKey
 * @param customizerFn
 * @returns {function(T=): function(any, string, TypedPropertyDescriptor<any>): undefined}
 *  - in the customizer, opts is mutable
 */
function makeOptionsDecorator(metadataKey) {
    var includeTargetKey = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var customizerFn = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    return function (opts) {
        opts = opts || {};
        return function (target, propertyKey, descriptor) {
            // If a customizer was provided then use it
            // Pass all important items
            // NOTE: opts it mutable
            if (customizerFn) customizerFn(opts, target, propertyKey);
            setMetadata(metadataKey, opts, target, includeTargetKey ? propertyKey : undefined);
        };
    };
}
exports.makeOptionsDecorator = makeOptionsDecorator;
//# sourceMappingURL=MetadataManager.js.map
