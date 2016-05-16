import {DynamoDB} from 'aws-sdk'
import {IKeyValue} from "typestore";
import {KeyType} from "./DynamoDBTypes"
export class DynamoDBKeyValue implements IKeyValue {

	constructor(
		public keySchema:DynamoDB.KeySchema,
		public hashValue:any,
		public rangeValue:any
	) {}

	toParam() {
		const params:any = {}
		this.keySchema.forEach((keyDef) => {
			params[keyDef.AttributeName] =
				(KeyType[keyDef.KeyType] === KeyType.HASH) ?
					this.hashValue :
					this.rangeValue
		})

		return params
	}
}