
import {Errors, IStorePlugin,ICoordinatorOptions,ICoordinator,Repo,PluginType,IModel} from '../../index'

export class NullStore implements IStorePlugin {

	private coordinator:ICoordinator

	constructor() { }

	get type() {
		return PluginType.Store
	}

	init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		this.coordinator = coordinator
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
		return repo
	}
}
