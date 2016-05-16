"use strict";

var Log = require('../log');
var Constants_1 = require("../Constants");
var log = Log.create(__filename);
/**
 * Decorate the repo for a given model
 *
 * @param opts for the repository
 * @return {function(Function)}
 */
function RepoDescriptor() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

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
function FinderDescriptor() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

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
//# sourceMappingURL=RepoDecorations.js.map
