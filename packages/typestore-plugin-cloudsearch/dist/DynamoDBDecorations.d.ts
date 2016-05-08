import { Repo } from 'typestore';
import { IDynamoDBFinderOptions } from "./DynamoDBTypes";
export declare function DynamoDBFinderDescriptor(opts: IDynamoDBFinderOptions): <R extends Repo<any>>(target: R, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
