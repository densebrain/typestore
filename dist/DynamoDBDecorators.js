"use strict";
var Constants_1 = require("./Constants");
var DynamoDBStore_1 = require("./DynamoDBStore");
function DynamoDBFinderDescriptor(opts) {
    return function (target, propertyKey, descriptor) {
        var returnType = Reflect.getMetadata(Constants_1.ReturnTypeKey, target, propertyKey);
        var all = returnType === Array;
        //log.debug('Finder return type',returnType,'return all',all)
        Reflect.defineMetadata(DynamoDBStore_1.DynamoDBFinderKey, opts, target, propertyKey);
    };
}
exports.DynamoDBFinderDescriptor = DynamoDBFinderDescriptor;

//# sourceMappingURL=DynamoDBDecorators.js.map
