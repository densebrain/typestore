/**
 * Attribute index configuration
 */
export interface IModelAttributeIndex {
    name: string;
    isSecondaryKey?: boolean;
    secondaryKey?: string;
}
/**
 * Model attribute options
 */
export interface IModelAttributeOptions {
    name?: string;
    type?: any;
    typeName?: string;
    primaryKey?: boolean;
    secondaryKey?: boolean;
    index?: IModelAttributeIndex;
}
/**
 * Options provided to model
 * decorator annotation
 */
export interface IModelOptions {
    clazzName?: string;
    clazz?: any;
    tableName?: string;
    attrs?: IModelAttributeOptions[];
}
export interface IModelKey {
}
export interface IKeyValue {
}
/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 *
 * @param opts
 */
export declare function ModelDescriptor(opts?: IModelOptions): (constructor: Function) => void;
/**
 * Decorator model attribute
 * @param opts
 * @returns {function(any, string): undefined}
 * @constructor
 */
export declare function AttributeDescriptor(opts?: IModelAttributeOptions): (target: any, propertyKey: string) => void;
