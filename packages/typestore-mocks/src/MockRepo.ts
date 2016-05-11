
import {
	DefaultModel,
	IKeyValue,
	Errors,
	Promise,
	IStorePlugin,
	ICoordinatorOptions,
	ICoordinator,
	Repo,
	IModel,
	IRepoPlugin,
	PluginType
} from 'typestore'
import {MockKeyValue} from "./MockStore";




export class MockRepoPlugin<M extends IModel> implements IRepoPlugin<M> {

	private recordCount = 0
	
	constructor(private store:IStorePlugin,private repo:Repo<M>) {
		repo.attach(this)
	}
	
	get type() {
		return PluginType.Repo
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