"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DynamoDBTypes_1 = require("./DynamoDBTypes");

var DynamoDBKeyValue = function () {
    function DynamoDBKeyValue(keySchema, hashValue, rangeValue) {
        _classCallCheck(this, DynamoDBKeyValue);

        this.keySchema = keySchema;
        this.hashValue = hashValue;
        this.rangeValue = rangeValue;
    }

    _createClass(DynamoDBKeyValue, [{
        key: "toParam",
        value: function toParam() {
            var _this = this;

            var params = {};
            this.keySchema.forEach(function (keyDef) {
                params[keyDef.AttributeName] = DynamoDBTypes_1.KeyType[keyDef.KeyType] === DynamoDBTypes_1.KeyType.HASH ? _this.hashValue : _this.rangeValue;
            });
            return params;
        }
    }]);

    return DynamoDBKeyValue;
}();

exports.DynamoDBKeyValue = DynamoDBKeyValue;
//# sourceMappingURL=DynamoDBKeyValue.js.map
