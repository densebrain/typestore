
import {IModelKey} from 'typestore'
import {DynamoDBModelKeyAttribute} from "./DynamoDBModelKeyAttribute";

export class DynamoDBModelKey implements IModelKey {

	constructor(
		private hashKey:DynamoDBModelKeyAttribute,
		private rangeKey:DynamoDBModelKeyAttribute) {
	}
}
