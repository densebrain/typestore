"use strict";
var Constants_1 = require("./Constants");
var JSONFormattingSpace = (process.env.NODE_ENV !== 'production') ? 4 : 0;
var ModelMapper = (function () {
    function ModelMapper(modelClazz) {
        this.modelClazz = modelClazz;
        this.modelAttrs = Reflect.getMetadata(Constants_1.DynoAttrKey, this.modelClazz.prototype);
    }
    ModelMapper.prototype.attr = function (key) {
        for (var _i = 0, _a = this.modelAttrs; _i < _a.length; _i++) {
            var it_1 = _a[_i];
            if (it_1.name === key) {
                return it_1;
            }
        }
        return null;
    };
    ModelMapper.prototype.toJson = function (o) {
        var _this = this;
        return JSON.stringify(o, function (key, value) {
            return (!_this.attr(key)) ? undefined : value;
        }, JSONFormattingSpace);
    };
    ModelMapper.prototype.toObject = function (o) {
        var obj = {};
        for (var _i = 0, _a = Object.keys(o); _i < _a.length; _i++) {
            var key = _a[_i];
            if (this.attr(key))
                obj[key] = o[key];
        }
        return obj;
    };
    ModelMapper.prototype.fromJson = function (json) {
        var _this = this;
        var jsonObj = JSON.parse(json, function (key, value) {
            return (!_this.attr(key)) ? undefined : value;
        });
        var o = new this.modelClazz();
        Object.assign(o, jsonObj);
        return o;
    };
    ModelMapper.prototype.fromObject = function (obj) {
        var o = new this.modelClazz();
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            if (this.attr(key))
                o[key] = obj[key];
        }
        return o;
    };
    return ModelMapper;
}());
exports.ModelMapper = ModelMapper;

//# sourceMappingURL=ModelMapper.js.map
