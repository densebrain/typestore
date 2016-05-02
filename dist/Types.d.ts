import * as AWS from 'aws-sdk';
export interface IManagerOptions {
    awsOptions?: AWS.ClientConfigPartial;
    dynamoEndpoint?: string;
    createTables?: boolean;
    prefix?: string;
}
export interface IAttributeOptions {
    name?: string;
    type?: any;
    key?: string;
}
export interface ITableOptions {
    writeThroughput?: number;
    readThroughput?: number;
}
export interface IModelOptions extends ITableOptions {
    tableName: string;
    clazzName?: string;
    attrs?: IAttributeOptions[];
}
