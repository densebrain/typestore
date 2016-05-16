"use strict";

var typestore_1 = require('typestore');
var DynamoDBConstants_1 = require("./DynamoDBConstants");
exports.DynamoDBFinderDescriptor = typestore_1.makeOptionsDecorator(DynamoDBConstants_1.DynamoDBFinderKey, true, function (opts, target, targetKey) {
    var returnType = typestore_1.getMetadataReturnType(target, targetKey);
    Object.assign(opts, {
        array: returnType === Array
    }, opts);
});
// export function DynamoDBFinderDescriptor(opts:IDynamoDBFinderOptions) {
//
// 	return function(
// 		target:any,
// 		propertyKey:string,
// 		descriptor:TypedPropertyDescriptor<any>
// 	) {
//
// 		const returnType = Reflect.getMetadata(ReturnTypeKey,target,propertyKey)
//
// 		const finalOpts = Object.assign({},{
// 			array:returnType === Array
// 		},opts)
//
// 		Reflect.defineMetadata(DynamoDBFinderKey,finalOpts,target,propertyKey)
// 	}
// }
//# sourceMappingURL=DynamoDBDecorations.js.map
