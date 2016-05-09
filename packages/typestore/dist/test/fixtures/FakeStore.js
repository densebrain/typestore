"use strict";
var Promise = require('../../Promise');
var Errors_1 = require("../../Errors");
var FakeStore = (function () {
    function FakeStore() {
    }
    FakeStore.prototype.init = function (manager, opts) {
        return Promise.resolve(true);
    };
    FakeStore.prototype.start = function () {
        return Promise.resolve(true);
    };
    FakeStore.prototype.stop = function () {
        return Promise.resolve(true);
    };
    FakeStore.prototype.syncModels = function () {
        return Errors_1.NotImplemented('syncModels');
    };
    FakeStore.prototype.getRepo = function (clazz) {
        return Errors_1.NotImplemented('getRepo');
    };
    return FakeStore;
}());
exports.FakeStore = FakeStore;

//# sourceMappingURL=FakeStore.js.map
