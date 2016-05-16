import {Repo,makeOptionsDecorator,getMetadataReturnType} from 'typestore'
import {IDynamoDBFinderOptions} from "./DynamoDBTypes"
import {DynamoDBFinderKey} from "./DynamoDBConstants";


export const DynamoDBFinderDescriptor =
	makeOptionsDecorator<IDynamoDBFinderOptions>(DynamoDBFinderKey,true,(opts,target,targetKey) => {
		const returnType = getMetadataReturnType(target,targetKey)

		Object.assign(opts,{
			array:returnType === Array
		},opts)
	})

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
