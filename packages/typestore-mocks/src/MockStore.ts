import {
	Errors, 
	Promise, 
	IStorePlugin, 
	IKeyValue, 
	ICoordinatorOptions, 
	ICoordinator,
	Repo, 
	IModel,
	PluginType
} from 'typestore'
import {MockRepoPlugin} from './MockRepo'

const NotImplemented = Errors.NotImplemented;

export class MockKeyValue implements IKeyValue {
	
	args

	constructor(...args:any[]) {
		this.args = args
	}
}

export class MockStore implements IStorePlugin {

	coordinator:ICoordinator

	constructor() {

	}

	get type() {
		return PluginType.Store
	}

	init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		return Promise.resolve(coordinator)
	}

	start():Promise<ICoordinator> {
		return Promise.resolve(this.coordinator)
	}

	stop():Promise<ICoordinator> {
		return Promise.resolve(this.coordinator)
	}

	syncModels():Promise<ICoordinator> {
		return Promise.resolve(this.coordinator)
	}


	initRepo<T extends Repo<M>, M extends IModel>(repo:T):T {
		return repo;
	}

}
