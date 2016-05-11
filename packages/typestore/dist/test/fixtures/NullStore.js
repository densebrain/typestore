"use strict";
var index_1 = require('../../index');
var NotImplemented = index_1.Errors.NotImplemented;
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
    NullStore.prototype.init = function (manager, opts) {
        return index_1.Promise.resolve(true);
    };
    NullStore.prototype.start = function () {
        return index_1.Promise.resolve(true);
    };
    NullStore.prototype.stop = function () {
        return index_1.Promise.resolve(true);
    };
    NullStore.prototype.syncModels = function () {
        return NotImplemented('syncModels');
    };
    NullStore.prototype.prepareRepo = function (repo) {
        return repo;
        //return NotImplemented('getRepo') as T
    };
    return NullStore;
}());
exports.NullStore = NullStore;

//# sourceMappingURL=NullStore.js.map
