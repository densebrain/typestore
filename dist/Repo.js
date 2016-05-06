"use strict";
var Errors_1 = require("./Errors");
var Constants_1 = require("./Constants");
var Repo = (function () {
    function Repo(modelClazz) {
        this._modelClazz = modelClazz;
        this._modelOpts = Reflect.getMetadata(Constants_1.DynoModelKey, modelClazz.prototype);
    }
    Object.defineProperty(Repo.prototype, "modelClazz", {
        get: function () {
            return this._modelClazz;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repo.prototype, "modelOpts", {
        get: function () {
            return this._modelOpts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repo.prototype, "tableName", {
        get: function () {
            return this.modelOpts.tableName;
        },
        enumerable: true,
        configurable: true
    });
    Repo.prototype.newModel = function () {
        return new this._modelClazz();
    };
    Repo.prototype.key = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return Errors_1.NotImplemented('key');
    };
    Repo.prototype.get = function (key) {
        return Errors_1.NotImplemented('get');
    };
    Repo.prototype.save = function (o) {
        return Errors_1.NotImplemented('save');
    };
    Repo.prototype.remove = function (key) {
        return Errors_1.NotImplemented('remove');
    };
    return Repo;
}());
exports.Repo = Repo;

//# sourceMappingURL=Repo.js.map
