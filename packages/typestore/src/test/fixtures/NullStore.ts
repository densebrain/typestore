
import {Errors, IStorePlugin,ICoordinatorOptions,ICoordinator,Repo,PluginType,IModel} from '../../index'
import {PluginEventType} from "../../PluginTypes";

export class NullStore implements IStorePlugin {

	type = PluginType.Store

	private coordinator:ICoordinator

	constructor() {

	}


	handle(eventType:PluginEventType, ...args):boolean|any {
		return false;
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
