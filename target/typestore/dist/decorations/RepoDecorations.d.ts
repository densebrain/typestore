import { IRepoOptions, IFinderOptions } from '../Types';
import { Repo } from "../Repo";
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
export declare function FinderDescriptor(opts?: IFinderOptions): <R extends Repo<any>>(target: R, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
