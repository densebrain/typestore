import { ISearchOptions } from 'typestore';
/**
 * COuld search specific search options
 */
export interface ICloudSearchOptions<R extends any> extends ISearchOptions<any> {
}
export declare const CloudSearchFinderDescriptor: (opts?: ICloudSearchOptions<any>) => (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => any;
