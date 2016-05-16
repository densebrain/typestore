import {
	IStorePlugin,
	IKeyValue, 
	ICoordinatorOptions, 
	ICoordinator,
	Repo, 
	IModel,
	PluginType,
	PluginEventType,
	repoAttachIfSupported
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

	supportedModels:any[]
	
	type = PluginType.Store
	
	coordinator:ICoordinator
	repoPlugins:IRepoPlugin<any>[]  = []
	
	constructor(...supportedModels:any[]) {
		this.supportedModels = supportedModels
	}


	handle(eventType:PluginEventType, ...args):boolean|any {
		switch(eventType) {
			case PluginEventType.RepoInit:
				repoAttachIfSupported(args[0] as Repo<any>, this)
				const repo:Repo<any> = args[0]
				return this.initRepo(repo)


		}
		return false;
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
