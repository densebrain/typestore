"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
require('reflect-metadata');
__export(require('./ModelTypes'));
__export(require('./PluginTypes'));
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
 * Coordinator options default implementation
 */
var CoordinatorOptions = (function () {
    function CoordinatorOptions(opts) {
        if (opts === void 0) { opts = {}; }
        Object.assign(this, opts, CoordinatorOptions.Defaults);
    }
    /**
     * Default manager options
     *
     * @type {{autoRegisterModules: boolean, syncStrategy: SyncStrategy, immutable: boolean}}
     */
    CoordinatorOptions.Defaults = {
        autoRegisterModules: true,
        syncStrategy: SyncStrategy.None,
        immutable: false
    };
    return CoordinatorOptions;
}());
exports.CoordinatorOptions = CoordinatorOptions;

//# sourceMappingURL=Types.js.map
