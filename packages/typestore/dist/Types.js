"use strict";
require('reflect-metadata');
var Errors_1 = require("./Errors");
/**
 * Simple base model implementation
 * uses reflection to determine type
 */
var DefaultModel = (function () {
    function DefaultModel() {
    }
    Object.defineProperty(DefaultModel.prototype, "clazzType", {
        get: function () {
            var type = Reflect.getOwnMetadata('design:type', this);
            if (!type)
                throw new Errors_1.NoReflectionMetataError('Unable to reflect type information');
            return type.name;
        },
        enumerable: true,
        configurable: true
    });
    return DefaultModel;
}());
exports.DefaultModel = DefaultModel;
(function (IndexType) {
    IndexType[IndexType["Add"] = 0] = "Add";
    IndexType[IndexType["Update"] = 1] = "Update";
    IndexType[IndexType["Remove"] = 2] = "Remove";
})(exports.IndexType || (exports.IndexType = {}));
var IndexType = exports.IndexType;
/**
 * Super simply default key mapper for search results
 * field names in, key out, must all be top level in result object
 *
 * @param fields
 * @returns {function(Repo<any>, {new(): R}, R): IModelKey}
 * @constructor
 */
function DefaultKeyMapper() {
    var fields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fields[_i - 0] = arguments[_i];
    }
    return function (repo, resultType, result) {
        var values = fields.map(function (field) { return result[field]; });
        return repo.key(values);
    };
}
exports.DefaultKeyMapper = DefaultKeyMapper;
/**
 * Sync strategy for updating models in the store
 */
(function (SyncStrategy) {
    SyncStrategy[SyncStrategy["Overwrite"] = 0] = "Overwrite";
    SyncStrategy[SyncStrategy["Update"] = 1] = "Update";
    SyncStrategy[SyncStrategy["None"] = 2] = "None";
})(exports.SyncStrategy || (exports.SyncStrategy = {}));
var SyncStrategy = exports.SyncStrategy;
var SyncStrategy;
(function (SyncStrategy) {
    SyncStrategy.toString = function (strategy) {
        return SyncStrategy[strategy];
    };
})(SyncStrategy = exports.SyncStrategy || (exports.SyncStrategy = {}));
/**
 * Manager options default implementation
 */
var ManagerOptions = (function () {
    function ManagerOptions(store, opts) {
        if (opts === void 0) { opts = {}; }
        this.store = store;
        Object.assign(this, opts, ManagerOptions.Defaults);
    }
    /**
     * Default manager options
     *
     * @type {{autoRegisterModules: boolean, syncStrategy: SyncStrategy, immutable: boolean}}
     */
    ManagerOptions.Defaults = {
        autoRegisterModules: true,
        syncStrategy: SyncStrategy.None,
        immutable: false
    };
    return ManagerOptions;
}());
exports.ManagerOptions = ManagerOptions;
(function (PluginType) {
    PluginType[PluginType["Indexer"] = 0] = "Indexer";
    PluginType[PluginType["Store"] = 1] = "Store";
})(exports.PluginType || (exports.PluginType = {}));
var PluginType = exports.PluginType;

//# sourceMappingURL=Types.js.map
