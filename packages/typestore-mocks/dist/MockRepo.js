"use strict";
var typestore_1 = require('typestore');
var MockStore_1 = require("./MockStore");
var MockRepoPlugin = (function () {
    function MockRepoPlugin(store, repo) {
        this.store = store;
        this.repo = repo;
        this.recordCount = 0;
        repo.attach(this);
    }
    Object.defineProperty(MockRepoPlugin.prototype, "type", {
        get: function () {
            return typestore_1.PluginType.Repo;
        },
        enumerable: true,
        configurable: true
    });
    MockRepoPlugin.prototype.key = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return new MockStore_1.MockKeyValue(args);
    };
    MockRepoPlugin.prototype.get = function (key) {
        if (!(key instanceof MockStore_1.MockKeyValue)) {
            return null;
        }
        return typestore_1.Promise.resolve(new this.repo.modelClazz());
    };
    MockRepoPlugin.prototype.save = function (o) {
        this.recordCount++;
        return typestore_1.Promise.resolve(o);
    };
    MockRepoPlugin.prototype.remove = function (key) {
        this.recordCount--;
        return typestore_1.Promise.resolve({});
    };
    MockRepoPlugin.prototype.count = function () {
        return typestore_1.Promise.resolve(this.recordCount);
    };
    return MockRepoPlugin;
}());
exports.MockRepoPlugin = MockRepoPlugin;

//# sourceMappingURL=MockRepo.js.map
