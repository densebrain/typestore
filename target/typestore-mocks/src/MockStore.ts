
import {Errors,Promise,IStore,IManagerOptions,IManager,Repo,IModel} from 'typestore'
import {MockRepo} from './MockRepo'

const NotImplemented = Errors.NotImplemented;

export class MockStore implements IStore {

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
		return Promise.resolve(true)
	}
	
	getRepo<T extends Repo<M>, M extends IModel>(clazz:{new():T;}):Repo<M> {
		return new MockRepo<M>(this,clazz) as Repo<M>
		
	}
}
