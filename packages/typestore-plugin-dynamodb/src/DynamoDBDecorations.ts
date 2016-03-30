import {Repo,Constants} from 'typestore'

import {IDynamoDBFinderOptions} from "./DynamoDBTypes"
import {DynamoDBFinderKey} from "./DynamoDBStore"

const {ReturnTypeKey} = Constants

export function DynamoDBFinderDescriptor(opts:IDynamoDBFinderOptions) {

	return function<R extends Repo<any>>(
		target:R,
		propertyKey:string,
		descriptor:TypedPropertyDescriptor<any>
	) {
		const returnType = Reflect.getMetadata(ReturnTypeKey,target,propertyKey)

		const finalOpts = Object.assign({},{
			array:returnType === Array
		},opts)

		Reflect.defineMetadata(DynamoDBFinderKey,finalOpts,target,propertyKey)
	}
}
