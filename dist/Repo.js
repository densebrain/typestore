"use strict";
var Errors_1 = require("./Errors");
var Constants_1 = require("./Constants");
var Repo = (function () {
    function Repo(modelClazz) {
        this.modelClazz = modelClazz;
        this.modelOpts = Reflect.getMetadata(Constants_1.DynoModelKey, modelClazz.prototype);
    }
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
    Repo.prototype.count = function () {
        return Errors_1.NotImplemented('count');
    };
    return Repo;
}());
exports.Repo = Repo;

//# sourceMappingURL=Repo.js.map
