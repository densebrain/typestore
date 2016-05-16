export interface IIndexedDBFinderOptions {
    filter: (o: any, ...args: any[]) => boolean;
}
export declare const IndexedDBFinderDescriptor: (opts?: IIndexedDBFinderOptions) => (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => any;
