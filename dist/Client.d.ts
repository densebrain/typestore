import * as AWS from 'aws-sdk';
import { IManagerOptions } from "./Types";
export declare class Client {
    private opts;
    private _docClient;
    private _dynamoClient;
    constructor(opts: IManagerOptions);
    serviceOptions: any;
    dynamoClient: AWS.DynamoDB;
    documentClient: AWS.DynamoDB.DocumentClient;
}
