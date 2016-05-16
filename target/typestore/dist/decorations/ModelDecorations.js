"use strict";

var Log = require('../log');
var Constants_1 = require("../Constants");
var MetadataManager_1 = require('../MetadataManager');
var log = Log.create(__filename);
/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 *
 * @param opts
 */
function ModelDescriptor() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return function (constructor) {
        // Make sure everything is valid
        //const type = Reflect.getOwnMetadata('design:type',constructor)
        var type = constructor;
        var attrs = Reflect.getOwnMetadata(Constants_1.TypeStoreAttrKey, constructor);
        var finalOpts = Object.assign({}, {
            clazz: constructor,
            clazzName: type.name,
            tableName: type.name,
            attrs: attrs
        }, opts);
        log.debug("Decorating: " + finalOpts.clazzName);
        Reflect.defineMetadata(Constants_1.TypeStoreModelKey, finalOpts, constructor);
    };
}
exports.ModelDescriptor = ModelDescriptor;
/**
 * Decorator model attribute
 * @param opts
 * @returns {function(any, string): undefined}
 * @constructor
 */
function AttributeDescriptor() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return function (target, propertyKey) {
        var attrType = MetadataManager_1.getMetadataType(target, propertyKey);
        opts = Object.assign({}, {
            type: attrType,
            name: propertyKey,
            typeName: attrType && attrType.name ? attrType.name : 'unknown type',
            key: propertyKey
        }, opts);
        // Update the attribute array
        var modelAttrs = MetadataManager_1.getMetadata(Constants_1.TypeStoreAttrKey, target.constructor) || [];
        modelAttrs.push(opts);
        MetadataManager_1.setMetadata(Constants_1.TypeStoreAttrKey, opts, target.constructor, propertyKey);
        MetadataManager_1.setMetadata(Constants_1.TypeStoreAttrKey, modelAttrs, target.constructor);
    };
}
exports.AttributeDescriptor = AttributeDescriptor;
//# sourceMappingURL=ModelDecorations.js.map
