"use strict";
var index_1 = require('../../index');
var NotImplemented = index_1.Errors.NotImplemented;
var NullStore = (function () {
    function NullStore() {
    }
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
    NullStore.prototype.getRepo = function (clazz) {
        return NotImplemented('getRepo');
    };
    return NullStore;
}());
exports.NullStore = NullStore;

//# sourceMappingURL=NullStore.js.map
