import { TableStatus } from "./DynamoDBTypes";
export declare function typeToDynamoType(type: any, typeName?: string): string;
export declare function tableNameParam(TableName: string): {
    TableName: string;
};
export declare function isTableStatusIn(status: string | TableStatus, ...statuses: any[]): boolean;
