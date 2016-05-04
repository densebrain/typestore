"use strict";
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
require('es6-shim');
require('reflect-metadata');
var _ = require('lodash');
var assert = require('assert');
var Promise_1 = require('./Promise');
var Log = require('./log');
var Constants_1 = require('./Constants');
var Messages_1 = require("./Messages");
var log = Log.create(__filename);
var Manager;
(function (Manager) {
    /**
     * Stores all registrations, enabling
     * them to be configured against a
     * changed client, multiple datasources,
     * utility scripts, etc
     *
     * @type {{}}
     */
    var modelRegistrations = {};
    /**
     * Retrieve model registrations
     *
     * @returns {TModelRegistrations}
     */
    function getModelRegistrations() {
        return modelRegistrations;
    }
    Manager.getModelRegistrations = getModelRegistrations;
    function findModelOptionsByClazz(clazz) {
        for (var _i = 0, _a = Object.keys(modelRegistrations); _i < _a.length; _i++) {
            var clazzName = _a[_i];
            var modelReg = modelRegistrations[clazzName];
            if (modelReg.clazz === clazz) {
                return modelReg;
            }
        }
        log.info('unable to find registered model for clazz', clazz, 'in', Object.keys(modelRegistrations));
        return null;
    }
    Manager.findModelOptionsByClazz = findModelOptionsByClazz;
    /**
     * Default options
     */
    var options;
    var initialized = false;
    // NOTE: settled and settling promise are overriden properties - check below namespace
    var started = false;
    var startPromise = null;
    function checkInitialized(not) {
        if (not === void 0) { not = false; }
        checkStarted(true);
        assert(not ? !initialized : initialized, Messages_1.msg(not ? Messages_1.Strings.ManagerInitialized : Messages_1.Strings.ManagerNotInitialized));
    }
    function checkStarted(not) {
        if (not === void 0) { not = false; }
        var valid = (not) ? !started : started;
        assert(valid, Messages_1.msg(not ? Messages_1.Strings.ManagerSettled : Messages_1.Strings.ManagerNotSettled));
    }
    /**
     * Set the manager options
     */
    function init(newOptions) {
        checkStarted(true);
        checkInitialized(true);
        initialized = true;
        options = options || newOptions;
        _.assign(options, newOptions);
        Manager.store = options.store;
        assert(Manager.store, Messages_1.msg(Messages_1.Strings.ManagerTypeStoreRequired));
        log.debug(Messages_1.msg(Messages_1.Strings.ManagerInitComplete));
        return Manager.store.init(this, options).return(true);
    }
    Manager.init = init;
    /**
     * Start the manager and embedded store from options
     *
     * @returns {Bluebird<boolean>}
     */
    function start() {
        return startPromise = Manager.store.start()
            .catch(function (err) {
            log.error(Messages_1.msg(Messages_1.Strings.ManagerFailedToStart), err);
            startPromise = null;
            return false;
        });
    }
    Manager.start = start;
    /**
     * Execute function either immediately if
     * ready or when the starting promise
     * completes
     *
     * @param fn
     */
    function execute(fn) {
        return new Promise_1.default(function (resolve, reject) {
            function executeFn() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                var result = fn.apply(void 0, args);
                resolve(result);
            }
            function handleError(err) {
                var fnName = (fn) ? fn.name : null;
                log.error(Messages_1.msg(Messages_1.Strings.ManagerErrorFn, fnName ? fnName : 'UNKNOWN'), err);
                reject(err);
            }
            if (startPromise) {
                startPromise.then(executeFn).catch(handleError);
            }
            else {
                Promise_1.default.resolve(executeFn).catch(handleError);
            }
        });
    }
    /**
     * Reset the manager status
     *
     * @returns {Manager.reset}
     */
    function reset() {
        if (startPromise)
            startPromise.cancel();
        return Promise_1.default.resolve(Manager.store ? Manager.store.stop() : true).then(function () {
            log.info("Store successfully stopped");
            return true;
        }).finally(function () {
            Manager.store = startPromise = null;
            if (options)
                options.store = null;
            initialized = false;
        });
    }
    Manager.reset = reset;
    /**
     * Register a model with the system
     *
     * @param clazzName
     * @param constructor
     * @param opts
     */
    function registerModel(clazzName, constructor, opts) {
        checkStarted(true);
        // Retrieve its attributes first
        opts.attrs = Reflect.getOwnMetadata(Constants_1.DynoAttrKey, constructor.prototype);
        // Define the metadata for the model
        Reflect.defineMetadata(Constants_1.DynoModelKey, opts, constructor.prototype);
        modelRegistrations[clazzName] = Object.assign({}, opts, {
            clazz: constructor
        });
    }
    Manager.registerModel = registerModel;
    function registerAttribute(target, propertyKey, opts) {
        checkStarted(true);
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
 * Internal vals
 *
 * @type {{}}
 */
var internal = {};
/**
 * Add getter/setters
 */
Object.defineProperties(Manager, {
    store: {
        set: function (newVal) {
            internal.store = newVal;
        },
        get: function () {
            return internal.store;
        },
        configurable: false
    },
    startPromise: {
        set: function (newVal) {
            internal.startPromise = newVal;
        },
        get: function () {
            return internal.startPromise;
        },
        configurable: false
    },
    started: {
        get: function () {
            var startPromise = internal.startPromise;
            return internal.startPromise !== null && startPromise.isResolved();
        },
        configurable: false
    }
});
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
