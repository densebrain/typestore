"use strict";

var typestore_1 = require('typestore');
var CloudSearchConstants_1 = require("./CloudSearchConstants");
exports.CloudSearchFinderDescriptor = typestore_1.makeOptionsDecorator(CloudSearchConstants_1.CloudSearchFinderKey, true);
// 	function CloudSearchDescriptor(opts:ICloudSearchOptions) {
// 	return function<R extends Repo<any>>(
// 		target:R,
// 		propertyKey:string,
// 		descriptor:TypedPropertyDescriptor<any>
// 	) {
// 		const returnType = Reflect.getMetadata(ReturnTypeKey,target,propertyKey)
//
// 		const finalOpts = Object.assign({},{
// 			array:returnType === Array
// 		},opts)
//
// 		Reflect.defineMetadata(DynamoDBFinderKey,finalOpts,target,propertyKey)
// 	}
// }
//# sourceMappingURL=CloudSearchDecorations.js.map
