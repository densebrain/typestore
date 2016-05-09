"use strict";
var index_1 = require('../../index');
var NotImplemented = index_1.Errors.NotImplemented;
var NoStore = (function () {
    function NoStore() {
    }
    NoStore.prototype.init = function (manager, opts) {
        return index_1.Promise.resolve(true);
    };
    NoStore.prototype.start = function () {
        return index_1.Promise.resolve(true);
    };
    NoStore.prototype.stop = function () {
        return index_1.Promise.resolve(true);
    };
    NoStore.prototype.syncModels = function () {
        return NotImplemented('syncModels');
    };
    NoStore.prototype.getRepo = function (clazz) {
        return NotImplemented('getRepo');
    };
    return NoStore;
}());
exports.NoStore = NoStore;

//# sourceMappingURL=NoStore.js.map
