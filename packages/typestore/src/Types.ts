//import 'reflect-metadata'
import {Repo} from "./Repo"
import {NoReflectionMetataError} from './Errors'
import {IModel, IModelType} from "./ModelTypes"
import {IIndexOptions,IPlugin} from "./PluginTypes";
import {isNumber} from './Util'


export * from './ModelTypes'
export * from './PluginTypes'


export enum ModelPersistenceEventType {
	Save = 1,
	Remove
}

export type ModelPersistenceEventCallback<M> = (type:ModelPersistenceEventType,...models:M[]) => void

/**
 * Options for repo decorations
 */
export interface IRepoOptions {
	indexes?:Array<IIndexOptions>
}

/**
 * Options for finder decorations
 */
export interface IFinderOptions {
	optional?:boolean
	single?:boolean
}

/**
 * Finder request for paging, etc
 */
export interface IFinderRequest {
	/**
	 * Record Offset to start from
	 */
	offset?:number

	/**
	 * Maximum number of results
	 */
	limit?:number
}

/**
 * Finder result array - not implemented yet, mostly
 */
export class FinderResultArray<T> extends Array<T> {

	pageNumber:number = -1
	totalPages:number = -1

	constructor(
		items:T[],
		public totalResults:number,
		public request:IFinderRequest = null
	) {
		super(...items)

		if (request) {
			this.totalPages = Math.ceil(totalResults / request.limit)
			this.pageNumber = isNumber(request.offset) ?
				Math.floor(request.offset / request.limit) :
				-1
		}
	}
}

/**
 * Simple base model implementation
 * uses reflection to determine type
 */
export class DefaultModel implements IModel {
	get clazzType() {
		const type = Reflect.getOwnMetadata('design:type',this)
		if (!type)
			throw new NoReflectionMetataError('Unable to reflect type information')

		return type.name
	}
}

/**
 * Sync strategy for updating models in the store
 */
export enum SyncStrategy {
	Overwrite,
	Update,
	None
}

export namespace SyncStrategy {
	export const toString = (strategy:SyncStrategy):string => {
		return SyncStrategy[strategy]
	}
}
/**
 * Coordinator configuration, this is usually extend
 * by individual store providers
 */

export interface ICoordinatorOptions {
	immutable?:boolean
	syncStrategy?: SyncStrategy
	autoRegisterModels?: boolean
}

/**
 * Coordinator options default implementation
 */
export class CoordinatorOptions implements ICoordinatorOptions {

	/**
	 * Default manager options
	 *
	 * @type {{autoRegisterModules: boolean, syncStrategy: SyncStrategy, immutable: boolean}}
	 */
	static Defaults = {
		autoRegisterModules:true,
		syncStrategy: SyncStrategy.None,
		immutable: false
	}

	constructor(opts = {}) {
		Object.assign(this,opts,CoordinatorOptions.Defaults)
	}
}


export interface IModelMapperDecorator<M> {
	(json:any,model:M):M
}
/**
 * Mapper interface for transforming objects back and forth between json
 * and their respective models
 */
export interface IModelMapper<M extends IModel> {
	toObject(o:M):Object
	toJson(o:M):string
	fromObject(json:Object,decorator?:IModelMapperDecorator<M>):M
	fromJson(json:string,decorator?:IModelMapperDecorator<M>):M
}

/**
 * Predicate for searching
 */
export interface IPredicate {
	(val:any):boolean
}

/**
 * Makes a predicate for reuse
 */
export interface IPredicateFactory {
	(...args:any[]):IPredicate
}

/**
 * Predicate for searching
 */
export interface ITypedPredicate<T> {
	(val:T):boolean
}

/**
 * Makes a predicate for reuse
 */
export interface ITypedPredicateFactory<T> {
	(type:{new():T},...args:any[]):ITypedPredicate<T>
}


/**
 * Coordinator interface for store provider development
 * and end user management
 *
 * TODO: Rename coordinator
 */
export interface ICoordinator {
	getOptions():ICoordinatorOptions
	getModels():IModelType[]
	getModel(clazz:any):IModelType
	getModelByName(name:string)
	start(...models):Promise<ICoordinator>
	init(opts:ICoordinatorOptions, ...plugins:IPlugin[]):Promise<ICoordinator>
	reset():Promise<ICoordinator>
	getRepo<T extends Repo<M>,M extends IModel>(clazz:{new(): T; }):T
}


