
import {Repo} from "./Repo";
import {IDynamoDBFinderOptions} from "./DynamoDBTypes";
import {ReturnTypeKey} from "./Constants";
import {DynamoDBFinderKey} from "./DynamoDBStore";

export function DynamoDBFinderDescriptor(opts:IDynamoDBFinderOptions) {

	return function<R extends Repo<any>>(
		target:R,
		propertyKey:string,
		descriptor:TypedPropertyDescriptor<any>
	) {
		const returnType = Reflect.getMetadata(ReturnTypeKey,target,propertyKey)
		const all = returnType === Array
		//log.debug('Finder return type',returnType,'return all',all)

		Reflect.defineMetadata(DynamoDBFinderKey,opts,target,propertyKey)
	}
}
