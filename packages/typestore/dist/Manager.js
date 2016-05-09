"use strict";
require('reflect-metadata');
require('./Globals');
var Promise = require('./Promise');
var assert = require('assert');
var Log = require('./log');
var Constants_1 = require('./Constants');
var Types_1 = require('./Types');
var Messages_1 = require("./Messages");
var ModelMapper_1 = require("./ModelMapper");
// Create logger
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
    var modelMap = {};
    var models = [];
    /**
     * Retrieve model registrations
     *
     * @returns {TModelTypeMap}
     */
    function getModels() {
        return models;
    }
    Manager.getModels = getModels;
    function findModel(predicate) {
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var modelType = models_1[_i];
            if (predicate(modelType)) {
                return modelType;
            }
        }
        log.info('unable to find registered model for clazz in', Object.keys(modelMap));
        return null;
    }
    function getModel(clazz) {
        return findModel(function (model) { return model.clazz === clazz; });
    }
    Manager.getModel = getModel;
    function getModelByName(name) {
        return findModel(function (model) { return model.name === name; });
    }
    Manager.getModelByName = getModelByName;
    /**
     * Default options
     */
    var options = new Types_1.ManagerOptions(null);
    function getOptions() {
        return options;
    }
    Manager.getOptions = getOptions;
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
        // Update the default options
        options = options || newOptions;
        Object.assign(options, newOptions);
        Manager.store = options.store;
        // Make sure we got a valid store
        assert(Manager.store, Messages_1.msg(Messages_1.Strings.ManagerTypeStoreRequired));
        // Manager is ready, now initialize the store
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
        var models = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            models[_i - 0] = arguments[_i];
        }
        checkStarted(true);
        models.forEach(registerModel);
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
        return new Promise(function (resolve, reject) {
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
            return (startPromise) ?
                startPromise.then(executeFn).catch(handleError) :
                Promise.resolve(executeFn).catch(handleError);
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
        return Promise.resolve((Manager.store) ? Manager.store.stop() : true).then(function () {
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
    function registerModel(constructor) {
        checkStarted(true);
        var model = getModel(constructor);
        if (model) {
            log.info("Trying to register " + model.name + " a second time? is autoregister enabled?");
            return;
        }
        var modelOpts = Reflect.getMetadata(Constants_1.TypeStoreModelKey, constructor);
        model = {
            options: modelOpts,
            name: modelOpts.clazzName,
            clazz: constructor
        };
        modelMap[modelOpts.clazzName] = model;
        models.push(model);
    }
    Manager.registerModel = registerModel;
    /**
     * Get a repository for the specified model/class
     *
     * @param clazz
     * @returns {T}
     */
    function getRepo(clazz) {
        return Manager.store.getRepo(clazz);
    }
    Manager.getRepo = getRepo;
    function getMapper(clazz) {
        return new ModelMapper_1.ModelMapper(clazz);
    }
    Manager.getMapper = getMapper;
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
