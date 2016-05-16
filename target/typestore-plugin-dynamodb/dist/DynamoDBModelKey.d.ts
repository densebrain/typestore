import { IModelKey } from 'typestore';
import { DynamoDBModelKeyAttribute } from "./DynamoDBModelKeyAttribute";
export declare class DynamoDBModelKey implements IModelKey {
    private hashKey;
    private rangeKey;
    constructor(hashKey: DynamoDBModelKeyAttribute, rangeKey: DynamoDBModelKeyAttribute);
}
