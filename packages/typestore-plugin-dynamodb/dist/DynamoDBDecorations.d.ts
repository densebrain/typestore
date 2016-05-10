import { IDynamoDBFinderOptions } from "./DynamoDBTypes";
export declare function DynamoDBFinderDescriptor(opts: IDynamoDBFinderOptions): <R extends any>(target: R, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
