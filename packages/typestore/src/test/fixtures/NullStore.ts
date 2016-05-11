
import {Errors,Promise,IStore,IManagerOptions,IManager,Repo,PluginType,IModel} from '../../index'


const NotImplemented = Errors.NotImplemented;

export class NullStore implements IStore {

	constructor() {

	}

	get type() {
		return PluginType.Store
	}

	init(manager:IManager, opts:IManagerOptions):Promise<boolean> {
		return Promise.resolve(true)
	}

	start():Promise<boolean> {
		return Promise.resolve(true)
	}

	stop():Promise<boolean> {
		return Promise.resolve(true)
	}

	syncModels():Promise<boolean> {
		return NotImplemented('syncModels') as Promise<boolean>
	}

	prepareRepo<T extends Repo<M>, M extends IModel>(repo:T):T {
		return repo
		//return NotImplemented('getRepo') as T
	}
}
