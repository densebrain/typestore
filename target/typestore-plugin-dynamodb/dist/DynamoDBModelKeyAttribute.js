"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DynamoDBUtil_1 = require("./DynamoDBUtil");
/**
 * Internal dynamo key map class
 */

var DynamoDBModelKeyAttribute = function () {
    function DynamoDBModelKeyAttribute(name, attrType, type) {
        _classCallCheck(this, DynamoDBModelKeyAttribute);

        this.name = name;
        this.attrType = attrType;
        this.type = type;
    }

    _createClass(DynamoDBModelKeyAttribute, [{
        key: "toKeySchema",
        value: function toKeySchema() {
            return {
                AttributeName: this.name,
                KeyType: this.type
            };
        }
    }, {
        key: "toAttributeDef",
        value: function toAttributeDef() {
            return {
                AttributeName: this.name,
                AttributeType: DynamoDBUtil_1.typeToDynamoType(this.attrType)
            };
        }
    }]);

    return DynamoDBModelKeyAttribute;
}();

exports.DynamoDBModelKeyAttribute = DynamoDBModelKeyAttribute;
//# sourceMappingURL=DynamoDBModelKeyAttribute.js.map
