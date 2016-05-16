import 'reflect-metadata'
import {Repo} from "./Repo"
import {NoReflectionMetataError} from './Errors'
import {IModel, IModelType} from "./ModelTypes"
import {IIndexOptions,IPlugin} from "./PluginTypes";


export * from './ModelTypes'
export * from './PluginTypes'


/**
 * Options for repo decorations
 */
export interface IRepoOptions {
	indexes?:IIndexOptions[]
}

/**
 * Options for finder decorations
 */
export interface IFinderOptions {
	optional?:boolean
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


/**
 * Mapper interface for transforming objects back and forth between json
 * and their respective models
 */
export interface IModelMapper<M extends IModel> {
	toObject(o:M):Object
	toJson(o:M):string
	fromObject(json:Object):M
	fromJson(json:string):M
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


