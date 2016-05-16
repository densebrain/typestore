"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants_1 = require("./Constants");
var JSONFormattingSpace = process.env.NODE_ENV !== 'production' ? 4 : 0;

var ModelMapper = function () {
    function ModelMapper(modelClazz) {
        _classCallCheck(this, ModelMapper);

        this.modelClazz = modelClazz;
        this.modelAttrs = Reflect.getMetadata(Constants_1.TypeStoreAttrKey, this.modelClazz);
    }

    _createClass(ModelMapper, [{
        key: "attr",
        value: function attr(key) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.modelAttrs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var it = _step.value;

                    if (it.name === key) {
                        return it;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return null;
        }
    }, {
        key: "toJson",
        value: function toJson(o) {
            var _this = this;

            return JSON.stringify(o, function (key, value) {
                return !_this.attr(key) ? undefined : value;
            }, JSONFormattingSpace);
        }
    }, {
        key: "toObject",
        value: function toObject(o) {
            var obj = {};
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(o)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var key = _step2.value;

                    if (this.attr(key)) obj[key] = o[key];
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return obj;
        }
    }, {
        key: "fromJson",
        value: function fromJson(json) {
            var _this2 = this;

            var jsonObj = JSON.parse(json, function (key, value) {
                return !_this2.attr(key) ? undefined : value;
            });
            var o = new this.modelClazz();
            Object.assign(o, jsonObj);
            return o;
        }
    }, {
        key: "fromObject",
        value: function fromObject(obj) {
            var o = new this.modelClazz();
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.keys(obj)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var key = _step3.value;

                    if (this.attr(key)) o[key] = obj[key];
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return o;
        }
    }]);

    return ModelMapper;
}();

exports.ModelMapper = ModelMapper;
//# sourceMappingURL=ModelMapper.js.map
