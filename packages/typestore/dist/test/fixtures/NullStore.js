"use strict";
var index_1 = require('../../index');
var NullStore = (function () {
    function NullStore() {
    }
    Object.defineProperty(NullStore.prototype, "type", {
        get: function () {
            return index_1.PluginType.Store;
        },
        enumerable: true,
        configurable: true
    });
    NullStore.prototype.init = function (coordinator, opts) {
        this.coordinator = coordinator;
        return index_1.Promise.resolve(coordinator);
    };
    NullStore.prototype.start = function () {
        return index_1.Promise.resolve(this.coordinator);
    };
    NullStore.prototype.stop = function () {
        return index_1.Promise.resolve(this.coordinator);
    };
    NullStore.prototype.syncModels = function () {
        return index_1.Promise.resolve(this.coordinator);
    };
    NullStore.prototype.initRepo = function (repo) {
        return repo;
    };
    return NullStore;
}());
exports.NullStore = NullStore;

//# sourceMappingURL=NullStore.js.map
