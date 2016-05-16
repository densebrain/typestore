/**
 * Internal dynamo key map class
 */
export declare class DynamoDBModelKeyAttribute {
    private name;
    private attrType;
    private type;
    constructor(name: string, attrType: any, type: KeyType);
    toKeySchema(): {
        AttributeName: string;
        KeyType: string;
    };
    toAttributeDef(): {
        AttributeName: string;
        AttributeType: string;
    };
}
