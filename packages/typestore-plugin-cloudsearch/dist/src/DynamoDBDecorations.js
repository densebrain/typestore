"use strict";

var typestore_1 = require('typestore');
var DynamoDBStore_1 = require("./DynamoDBStore");
var ReturnTypeKey = typestore_1.Constants.ReturnTypeKey;

function DynamoDBFinderDescriptor(opts) {
    return function (target, propertyKey, descriptor) {
        var returnType = Reflect.getMetadata(ReturnTypeKey, target, propertyKey);
        var finalOpts = Object.assign({}, {
            array: returnType === Array
        }, opts);
        Reflect.defineMetadata(DynamoDBStore_1.DynamoDBFinderKey, finalOpts, target, propertyKey);
    };
}
exports.DynamoDBFinderDescriptor = DynamoDBFinderDescriptor;
//# sourceMappingURL=DynamoDBDecorations.js.map
