

import {typeToDynamoType} from "./DynamoDBUtil";
/**
 * Internal dynamo key map class
 */
export class DynamoDBModelKeyAttribute {

	constructor(
		private name:string,
		private attrType:any,
		private type:KeyType) {
	}

	toKeySchema() {
		return {
			AttributeName:this.name,
			KeyType:this.type
		}
	}

	toAttributeDef() {
		return {
			AttributeName:this.name,
			AttributeType: typeToDynamoType(this.attrType)
		}
	}
}

