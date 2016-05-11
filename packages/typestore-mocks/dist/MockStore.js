"use strict";
var typestore_1 = require('typestore');
var NotImplemented = typestore_1.Errors.NotImplemented;
var MockKeyValue = (function () {
    function MockKeyValue() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this.args = args;
    }
    return MockKeyValue;
}());
exports.MockKeyValue = MockKeyValue;
var MockStore = (function () {
    function MockStore() {
    }
    Object.defineProperty(MockStore.prototype, "type", {
        get: function () {
            return typestore_1.PluginType.Store;
        },
        enumerable: true,
        configurable: true
    });
    MockStore.prototype.init = function (coordinator, opts) {
        return typestore_1.Promise.resolve(coordinator);
    };
    MockStore.prototype.start = function () {
        return typestore_1.Promise.resolve(this.coordinator);
    };
    MockStore.prototype.stop = function () {
        return typestore_1.Promise.resolve(this.coordinator);
    };
    MockStore.prototype.syncModels = function () {
        return typestore_1.Promise.resolve(this.coordinator);
    };
    MockStore.prototype.initRepo = function (repo) {
        return repo;
    };
    return MockStore;
}());
exports.MockStore = MockStore;

//# sourceMappingURL=MockStore.js.map
