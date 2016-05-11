"use strict";
var Promise = require('./Promise');
var Constants_1 = require("./Constants");
var Types_1 = require("./Types");
var Coordinator_1 = require('./Coordinator');
var Errors_1 = require("./Errors");
var Log = require('./log');
var PluginTypes_1 = require("./PluginTypes");
var Util_1 = require("./Util");
var ModelMapper_1 = require("./ModelMapper");
var log = Log.create(__filename);
/**
 * The core Repo implementation
 *
 * When requested from the coordinator,
 * it offers itself to all configured plugins for
 * them to attach to the model pipeline
 *
 *
 */
var Repo = (function () {
    /**
     * Core repo is instantiated by providing the implementing/extending
     * class and the model that will be supported
     *
     * @param repoClazz
     * @param modelClazz
     */
    function Repo(repoClazz, modelClazz) {
        this.repoClazz = repoClazz;
        this.modelClazz = modelClazz;
        this.plugins = Array();
        this.modelType = Coordinator_1.Coordinator.getModel(modelClazz);
        this.modelOpts = this.modelType.options;
        this.repoOpts = Reflect.getMetadata(Constants_1.TypeStoreRepoKey, repoClazz);
    }
    Repo.prototype.start = function () {
        // Grab a mapper
        this.mapper = this.getMapper(this.modelClazz);
        // Decorate all the finders
        this.decorateFinders();
    };
    Repo.prototype.getMapper = function (clazz) {
        return new ModelMapper_1.ModelMapper(clazz);
    };
    Repo.prototype.getRepoPlugins = function () {
        return Util_1.PluginFilter(this.plugins, PluginTypes_1.PluginType.Repo);
        // return this.plugins
        // 	.filter((plugin) => isRepoPlugin(plugin)) as IRepoPlugin<M>[]
    };
    Repo.prototype.getFinderPlugins = function () {
        return Util_1.PluginFilter(this.plugins, PluginTypes_1.PluginType.Finder);
    };
    /**
     * Attach a plugin to the repo - could be a store,
     * indexer, etc, etc
     *
     * @param plugin
     * @returns {Repo}
     */
    Repo.prototype.attach = function (plugin) {
        if (this.plugins.includes(plugin)) {
            log.warn("Trying to register repo plugin a second time");
        }
        else {
            this.plugins.push(plugin);
        }
        return this;
    };
    Repo.prototype.decorateFinders = function () {
        var _this = this;
        var finderKeys = Reflect.getMetadata(Constants_1.TypeStoreFindersKey, this);
        if (finderKeys) {
            finderKeys.forEach(function (finderKey) {
                var finder = null;
                for (var _i = 0, _a = _this.plugins; _i < _a.length; _i++) {
                    var plugin = _a[_i];
                    if (!Util_1.isFunction(plugin.decorateFinder))
                        continue;
                    var finderPlugin = plugin;
                    if (finder = finderPlugin.decorateFinder(_this, finderKey))
                        break;
                }
                if (!finder)
                    finder = _this.genericFinder(finderKey);
                if (!finder)
                    Errors_1.NotImplemented("No plugin supports this finder " + finderKey);
                _this.setFinder(finderKey, finder);
            });
        }
    };
    /**
     * Create a generic finder, in order
     * to do this search options must have been
     * annotated on the model
     *
     * @param finderKey
     * @returns {any}
     */
    Repo.prototype.genericFinder = function (finderKey) {
        var _this = this;
        var opts = Reflect.getMetadata(Constants_1.TypeStoreFinderKey, this, finderKey);
        var searchOpts = opts.searchOptions;
        if (!searchOpts) {
            log.debug('Generic finders are only created with a specified SearchProvider');
            return null;
        }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return searchOpts.provider.search(_this.modelType, searchOpts, args).then(function (results) {
                // Once the provider returns the resulting data,
                // pass it to the mapper to get keys
                var keys = results.map(function (result) {
                    return searchOpts.resultKeyMapper(_this, searchOpts.resultType, result);
                });
                return Promise.map(keys, function (key) {
                    return _this.get(key);
                });
            });
        };
    };
    /**
     * Set a finder function on the repo
     *
     * @param finderKey
     * @param finderFn
     */
    Repo.prototype.setFinder = function (finderKey, finderFn) {
        this[finderKey] = finderFn;
    };
    /**
     * Call out to the indexers
     *
     * @param type
     * @param models
     * @returns {Bluebird<boolean>}
     */
    Repo.prototype.index = function (type) {
        var _this = this;
        var models = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            models[_i - 1] = arguments[_i];
        }
        return Promise.map(this.repoOpts.indexers || [], function (indexerConfig) {
            return (_a = indexerConfig.indexer).index.apply(_a, [type, indexerConfig, _this.modelType, _this].concat(models));
            var _a;
        }).return(true);
    };
    Repo.prototype.indexPromise = function (action) {
        var _this = this;
        return function (models) {
            return _this.index.apply(_this, [action].concat(models.filter(function (model) { return !!model; })))
                .return(models);
        };
    };
    /**
     * Not implemented
     *
     * @param args
     * @returns {null}
     */
    Repo.prototype.key = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var _a = 0, _b = this.getRepoPlugins(); _a < _b.length; _a++) {
            var plugin = _b[_a];
            var key = plugin.key.apply(plugin, args);
            if (key)
                return key;
        }
        return Errors_1.NotImplemented('key');
    };
    /**
     * Get one or more models with keys
     *
     * @param key
     * @returns {null}
     */
    Repo.prototype.get = function (key) {
        return Promise
            .map(this.getRepoPlugins(), function (plugin) { return plugin.get(key); })
            .then(function (results) {
            for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
                var result = results_1[_i];
                if (result)
                    return result;
            }
            return null;
        });
    };
    /**
     * Save model
     *
     * @param o
     * @returns {null}
     */
    Repo.prototype.save = function (o) {
        return Promise
            .map(this.getRepoPlugins(), function (plugin) { return plugin.save(o); })
            .then(this.indexPromise(Types_1.IndexAction.Add))
            .then(function (results) {
            for (var _i = 0, results_2 = results; _i < results_2.length; _i++) {
                var result = results_2[_i];
                if (result)
                    return result;
            }
            return null;
        });
    };
    /**
     * Remove a model
     *
     * @param key
     * @returns {null}
     */
    Repo.prototype.remove = function (key) {
        var _this = this;
        return this
            .get(key)
            .then(function (model) {
            if (!model) {
                log.warn("No model found to remove with key", key);
                return null;
            }
            return Promise
                .map(_this.getRepoPlugins(), function (plugin) { return plugin.remove(key); })
                .return([model])
                .then(_this.indexPromise(Types_1.IndexAction.Remove));
        });
    };
    /**
     * Count models
     *
     * @returns {null}
     */
    Repo.prototype.count = function () {
        return Promise
            .map(this.getRepoPlugins(), function (plugin) { return plugin.count(); })
            .then(function (results) {
            return results.reduce(function (prev, current) { return prev + current; });
        });
    };
    return Repo;
}());
exports.Repo = Repo;

//# sourceMappingURL=Repo.js.map
