import {
	Errors, 
	IStorePlugin,
	IKeyValue, 
	ICoordinatorOptions, 
	ICoordinator,
	Repo, 
	IModel,
	PluginType
} from 'typestore'
import {IRepoPlugin} from "../../typestore/src/PluginTypes";
import {MockRepoPlugin} from "./MockRepoPlugin";

/**
 * Mock key value, gives whatever it gets
 */
export class MockKeyValue implements IKeyValue {
	
	
	
	args

	constructor(...args:any[]) {
		this.args = args
	}
}

/**
 * Mock store for testing, spying, etc
 */
export class MockStore implements IStorePlugin {

	
	type = PluginType.Store
	
	coordinator:ICoordinator
	repoPlugins:IRepoPlugin<any>[]  = []
	
	constructor() {

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
		this.repoPlugins.push(new MockRepoPlugin(this,repo))
		return repo;
	}

}
