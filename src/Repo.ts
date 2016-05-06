import Promise = require('bluebird')

import {IModelKey, IModelOptions, IKeyValue} from "./Types";
import {NotImplemented} from "./Errors";
import {DynoModelKey} from "./Constants";

export abstract class Repo<M> {

	private _modelClazz
	private _modelOpts:IModelOptions

	constructor(modelClazz:{new ():M;}) {
		this._modelClazz = modelClazz
		this._modelOpts = Reflect.getMetadata(DynoModelKey,modelClazz.prototype)
	}

	get modelClazz():M {
		return this._modelClazz
	}

	get modelOpts() {
		return this._modelOpts
	}

	get tableName() {
		return this.modelOpts.tableName
	}

	newModel():M {
		return new this._modelClazz()
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

	
	remove(key:IModelKey):Promise<M> {
		return NotImplemented('remove')
	}
}
