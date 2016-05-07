import Promise = require('bluebird')

import {IModelKey, IModelOptions, IKeyValue} from "./Types";
import {NotImplemented} from "./Errors";
import {DynoModelKey} from "./Constants";

export abstract class Repo<M> {

	protected modelClazz
	protected modelOpts:IModelOptions

	constructor(modelClazz:{new ():M;}) {
		this.modelClazz = modelClazz
		this.modelOpts = Reflect.getMetadata(DynoModelKey,modelClazz.prototype)
	}

	key(...args):IKeyValue {
		return NotImplemented('key')
	}

	get(key:IKeyValue):Promise<M> {
		return NotImplemented('get')
	}

	save(o:M):Promise<M> {
		return NotImplemented('save')
	}


	remove(key:IKeyValue):Promise<any> {
		return NotImplemented('remove')
	}

	count():Promise<number> {
		return NotImplemented('count')
	}
}
