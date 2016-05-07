import 'reflect-metadata';
import { IModelOptions, IRepoOptions, IModelAttributeOptions } from './Types';
import { Repo } from "./Repo";
/**
 * Decorate a specified class, making it a
 * PersistableModel
 *
 * Set process.env.DYNO_SKIP to true in order to skip
 * decorations - useful in dual purpose classes,
 * in webpack use DefinePlugin
 *
 * @param {opts:IModelOptions} Options for this model generation
 */
export declare function ModelDescriptor(opts: IModelOptions): (constructor: Function) => void;
/**
 * Decorator model attribute
 * @param opts
 * @returns {function(any, string): undefined}
 * @constructor
 */
export declare function AttributeDescriptor(opts: IModelAttributeOptions): (target: any, propertyKey: string) => void;
/**
 * Decorate the repo for a given model
 *
 * @param opts for the repository
 * @return {function(Function)}
 */
export declare function RepoDescriptor(opts?: IRepoOptions): (constructor: Function) => void;
/**
 * Describe a finder function that has to be implemented by the store
 *
 * @returns {function(any, string, TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any>}
 */
export declare function FinderDescriptor(): <R extends Repo<any>>(target: R, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
