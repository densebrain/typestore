
import {
	DefaultModel,
	IKeyValue,
	Errors,
	IStorePlugin,
	ICoordinatorOptions,
	ICoordinator,
	Repo,
	IModel,
	IRepoPlugin,
	PluginType,
	ModelEvent
} from 'typestore'
import {MockKeyValue} from "./MockStore";


export class MockRepoPlugin<M extends IModel> implements IRepoPlugin<M> {

	type = PluginType.Repo

	private coordinator
	private recordCount = 0

	constructor(private store:IStorePlugin,private repo:Repo<M>) {
		repo.attach(this)
	}
	



	init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		this.coordinator = coordinator
		return Promise.resolve(coordinator);
	}


	start():Promise<ICoordinator> {
		return Promise.resolve(this.coordinator)
	}

	stop():Promise<ICoordinator> {
		return Promise.resolve(this.coordinator)
	}

	key(...args):MockKeyValue {
		return new MockKeyValue(args)
	}

	
	get(key:IKeyValue):Promise<M> {
		if (!(key instanceof MockKeyValue)) {
			return null
		}
		
		return Promise.resolve(new this.repo.modelClazz()) as Promise<M>
	}

	save(o:M):Promise<M> {
		this.recordCount++
		return Promise.resolve(o)
	}

	remove(key:IKeyValue):Promise<any> {
		this.recordCount--
		return Promise.resolve({})
	}

	count():Promise<number> {
		return Promise.resolve(this.recordCount)
	}
}