/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
"use strict";
require('reflect-metadata');
var _ = require('lodash');
var assert = require('assert');
var Log = require('./log');
var Client_1 = require('./Client');
var Constants_1 = require('./Constants');
var log = Log.create(__filename);
var Manager;
(function (Manager) {
    var models = {};
    /**
     * Default options
     */
    var options = {
        createTables: true
    };
    var ready = false;
    /**
     * Ref to aws client
     */
    var client;
    /**
     * Set the manager options
     */
    function init(newOptions) {
        ready = true;
        _.assign(options, newOptions);
        client = new Client_1.Client(options);
    }
    Manager.init = init;
    function checkReady() {
        assert(ready, 'The system must be initialized before registering models, etc');
    }
    /**
     * Register a model with the system
     *
     * @param clazzName
     * @param constructor
     * @param opts
     */
    function registerModel(clazzName, constructor, opts) {
        checkReady();
        // Retrieve its attributes first
        opts.attrs = Reflect.getOwnMetadata(Constants_1.DynoAttrKey, constructor.prototype);
        // Define the metadata for the model
        Reflect.defineMetadata(Constants_1.DynoModelKey, opts, constructor.prototype);
        models[clazzName] = _.assign({}, opts, {
            clazz: constructor
        });
    }
    Manager.registerModel = registerModel;
    function registerAttribute(target, propertyKey, opts) {
        checkReady();
        var attrType = Reflect.getMetadata('design:type', target, propertyKey);
        _.defaults(opts, {
            type: attrType,
            typeName: _.get(attrType, 'name', 'unknown type'),
            key: propertyKey
        });
        log.info("Decorating " + propertyKey, opts);
        var modelAttrs = Reflect.getMetadata(Constants_1.DynoAttrKey, target) || [];
        modelAttrs.push(opts);
        Reflect.defineMetadata(Constants_1.DynoAttrKey, modelAttrs, target);
    }
    Manager.registerAttribute = registerAttribute;
})(Manager = exports.Manager || (exports.Manager = {}));
/**
 * Management service
 */
// export const Service = {
// 	/**
// 	 * Save a persistable model
// 	 */
// 	save<T extends PersistableModel>(model:T):T {
// 		return null
// 	},
// 	get<T,K>(key:K):T {
// 		return null
// 	}
// }
//# sourceMappingURL=Manager.js.map