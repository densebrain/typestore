"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var typestore_1 = require('typestore');
var MockRepo = (function (_super) {
    __extends(MockRepo, _super);
    function MockRepo(store, repoClazz) {
        _super.call(this, repoClazz, new repoClazz().modelClazz);
        this.store = store;
        this.repoClazz = repoClazz;
        this.recordCount = 0;
    }
    MockRepo.prototype.key = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return { args: args };
    };
    MockRepo.prototype.get = function (key) {
        return typestore_1.Promise.resolve(new this.modelClazz());
    };
    MockRepo.prototype.save = function (o) {
        this.recordCount++;
        return typestore_1.Promise.resolve(o);
    };
    MockRepo.prototype.remove = function (key) {
        this.recordCount--;
        return typestore_1.Promise.resolve({});
    };
    MockRepo.prototype.count = function () {
        return typestore_1.Promise.resolve(this.recordCount);
    };
    return MockRepo;
}(typestore_1.Repo));
exports.MockRepo = MockRepo;

//# sourceMappingURL=MockRepo.js.map
