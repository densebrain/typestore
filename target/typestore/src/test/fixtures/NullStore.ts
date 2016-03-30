
import {Errors,Promise,IStore,IManagerOptions,IManager,Repo,IModel} from '../../index'

const NotImplemented = Errors.NotImplemented;

export class NullStore implements IStore {

	constructor() {

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

	getRepo<T extends Repo<M>, M extends IModel>(clazz:{new():T;}):T {
		return NotImplemented('getRepo') as T
	}
}
