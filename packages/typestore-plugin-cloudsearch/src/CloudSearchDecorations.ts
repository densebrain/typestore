
import {ISearchOptions,makeOptionsDecorator} from 'typestore'
import {CloudSearchFinderKey} from "./CloudSearchConstants";

/**
 * COuld search specific search options
 */
export interface ICloudSearchOptions<R extends any> extends ISearchOptions<any> { }


export const CloudSearchFinderDescriptor = makeOptionsDecorator<ICloudSearchOptions<any>>(CloudSearchFinderKey,true)
	
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