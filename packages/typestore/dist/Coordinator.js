"use strict";
require('reflect-metadata');
require('./Globals');
var Promise = require('./Promise');
var assert = require('assert');
var Log = require('./log');
var Constants_1 = require('./Constants');
var Types_1 = require('./Types');
var Messages_1 = require("./Messages");
var Util_1 = require("./Util");
// Create logger
var log = Log.create(__filename);
var Coordinator;
(function (Coordinator) {
    var plugins = [];
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
    Coordinator.getModels = getModels;
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
    Coordinator.getModel = getModel;
    function getModelByName(name) {
        return findModel(function (model) { return model.name === name; });
    }
    Coordinator.getModelByName = getModelByName;
    /**
     * Default options
     */
    var options = new Types_1.CoordinatorOptions(null);
    function getOptions() {
        return options;
    }
    Coordinator.getOptions = getOptions;
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
    function stores() {
        return Util_1.PluginFilter(plugins, Types_1.PluginType.Store);
    }
    Coordinator.stores = stores;
    /**
     * Set the coordinator options
     */
    function init(newOptions) {
        var _this = this;
        var newPlugins = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            newPlugins[_i - 1] = arguments[_i];
        }
        checkStarted(true);
        checkInitialized(true);
        initialized = true;
        plugins.push.apply(plugins, newPlugins);
        // Update the default options
        options = options || newOptions;
        Object.assign(options, newOptions);
        // Make sure we got a valid store
        assert(stores().length > 0, Messages_1.msg(Messages_1.Strings.ManagerTypeStoreRequired));
        // Coordinator is ready, now initialize the store
        log.debug(Messages_1.msg(Messages_1.Strings.ManagerInitComplete));
        return Promise
            .map(stores(), function (store) { return store.init(_this, options); })
            .return(this);
    }
    Coordinator.init = init;
    /**
     * Start the coordinator and embedded store from options
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
        return startPromise = Promise
            .map(stores(), function (store) { return store.start(); })
            .return(this)
            .catch(function (err) {
            log.error(Messages_1.msg(Messages_1.Strings.ManagerFailedToStart), err);
            startPromise = null;
        });
    }
    Coordinator.start = start;
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
     * Reset the coordinator status
     *
     * @returns {Coordinator.reset}
     */
    function reset() {
        if (startPromise)
            startPromise.cancel();
        return Promise
            .map(stores(), function (store) { return store.stop(); })
            .return(this)
            .finally(function () {
            startPromise = null;
            plugins.length = 0;
            initialized = false;
        });
    }
    Coordinator.reset = reset;
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
    Coordinator.registerModel = registerModel;
    /**
     * Get a repository for the specified model/class
     *
     * @param clazz
     * @returns {T}
     */
    function getRepo(clazz) {
        var repo = new clazz();
        stores().forEach(function (store) { return store.initRepo(repo); });
        repo.start();
        return repo;
    }
    Coordinator.getRepo = getRepo;
})(Coordinator = exports.Coordinator || (exports.Coordinator = {}));
/**
 * Internal vals
 *
 * @type {{}}
 */
var internal = {};
/**
 * Add getter/setters
 */
Object.defineProperties(Coordinator, {
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

//# sourceMappingURL=Coordinator.js.map
