import { DynamoDB } from 'aws-sdk';
import { IKeyValue } from "typestore";
export declare class DynamoDBKeyValue implements IKeyValue {
    keySchema: DynamoDB.KeySchema;
    hashValue: any;
    rangeValue: any;
    constructor(keySchema: DynamoDB.KeySchema, hashValue: any, rangeValue: any);
    toParam(): any;
}
