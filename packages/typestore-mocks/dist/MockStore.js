"use strict";
var typestore_1 = require('typestore');
var NotImplemented = typestore_1.Errors.NotImplemented;
var MockStore = (function () {
    function MockStore() {
    }
    MockStore.prototype.init = function (manager, opts) {
        return typestore_1.Promise.resolve(true);
    };
    MockStore.prototype.start = function () {
        return typestore_1.Promise.resolve(true);
    };
    MockStore.prototype.stop = function () {
        return typestore_1.Promise.resolve(true);
    };
    MockStore.prototype.syncModels = function () {
        return typestore_1.Promise.resolve(true);
    };
    MockStore.prototype.prepareRepo = function (repo) {
        return repo;
    };
    return MockStore;
}());
exports.MockStore = MockStore;

//# sourceMappingURL=MockStore.js.map
