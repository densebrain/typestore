import 'reflect-metadata';
import { ITableOptions, IModelOptions, IAttributeOptions } from './Types';
export declare function setDefaultTableOptions(newTableOptions: ITableOptions): void;
/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 */
export declare function ModelDescriptor(opts: IModelOptions): (constructor: Function) => void;
export declare function AttributeDescriptor(opts: IAttributeOptions): (target: any, propertyKey: string) => void;
