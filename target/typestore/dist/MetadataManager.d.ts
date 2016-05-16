import 'reflect-metadata';
/**
 * Simple pass thru to define metadata
 *
 * @param metadataKey
 * @param metadata
 * @param target
 * @param targetKey
 */
export declare function setMetadata(metadataKey: string, metadata: any, target: any, targetKey?: string): void;
/**
 * Get metadata
 *
 * @param metadataKey
 * @param target
 * @param targetKey
 * @returns {any}
 */
export declare function getMetadata(metadataKey: string, target: any, targetKey?: string): any;
export declare function makeMetadataGetter(metadataKey: string): (target: any, targetKey: string) => any;
export declare const getMetadataReturnType: (target: any, targetKey: string) => any;
export declare const getMetadataType: (target: any, targetKey: string) => any;
/**
 * Property decorator types for the decorator and the
 * factories used with simple metadata
 */
export declare type MetadataPropertyDecorator = (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => any;
export declare type MetadataPropertyDecoratorFactory<T> = (opts?: T) => MetadataPropertyDecorator;
/**
 * Create a simple options decorator for things like finders
 *
 * @param metadataKey
 * @param includeTargetKey
 * @param customizerFn
 * @returns {function(T=): function(any, string, TypedPropertyDescriptor<any>): undefined}
 *  - in the customizer, opts is mutable
 */
export declare function makeOptionsDecorator<T>(metadataKey: string, includeTargetKey?: boolean, customizerFn?: (opts: T, target: any, targetKey: string) => any): MetadataPropertyDecoratorFactory<T>;
