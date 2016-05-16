import * as Log from '../log'
import {Coordinator} from '../Coordinator'
import {IRepoOptions, IModel, IFinderOptions} from '../Types'
import {
	TypeStoreFinderKey,
	TypeStoreFindersKey,
	TypeStoreAttrKey,
	TypeStoreModelKey,
	TypeStoreRepoKey
} from "../Constants";
import {Repo} from "../Repo";
import {NoReflectionMetataError} from "../Errors";

const log = Log.create(__filename)

/**
 * Decorate the repo for a given model
 *
 * @param opts for the repository
 * @return {function(Function)}
 */
export function RepoDescriptor(opts:IRepoOptions = {}) {


	return function (constructor:Function) {
		Reflect.defineMetadata(TypeStoreRepoKey,opts,constructor)
	}
}

/**
 * Describe a finder function that has to be implemented by the store
 *
 * @returns {function(any, string, TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any>}
 */
export function FinderDescriptor(opts:IFinderOptions = {}) {

	return function<R extends Repo<any>>(
		target:R,
		propertyKey:string,
		descriptor:TypedPropertyDescriptor<any>
	) {
		// Add the options to metadata
		Reflect.defineMetadata(TypeStoreFinderKey,opts,target,propertyKey)

		// Now add the finders to the repo metadata
		const finders = Reflect.getMetadata(TypeStoreFindersKey,target) || []
		finders.push(propertyKey)
		Reflect.defineMetadata(TypeStoreFindersKey,finders,target)
		//return descriptor
	}
}
