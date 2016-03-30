
import {DefaultModel,IKeyValue,Errors,Promise,IStore,IManagerOptions,IManager,Repo,IModel} from 'typestore'

export class MockRepo<M extends IModel> extends Repo<M> {

	private recordCount = 0
	
	constructor(private store:IStore,private repoClazz:any) {
		super(repoClazz,new repoClazz().modelClazz)
	}

	key(...args):IKeyValue {
		return {args}
	}

	
	get(key:IKeyValue):Promise<M> {

		return Promise.resolve(new this.modelClazz())  as Promise<M>
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