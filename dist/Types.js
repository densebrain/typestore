"use strict";
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

//# sourceMappingURL=Types.js.map
