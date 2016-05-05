import Promise = require('bluebird')

import {IRepo, IModelKey} from "./Types";
import {NotImplemented} from "./Decorations";

export class DefaultRepo<M> extends IRepo<M> {


	@NotImplemented
	key(...args):IModelKey {
		return null
	}

	@NotImplemented
	get(key:IModelKey):Promise<M> {
		return null
	}

	@NotImplemented
	create(o:M):Promise<M> {
		return null
	}

	@NotImplemented
	update(o:M):Promise<M> {
		return null
	}

	@NotImplemented
	remove(key:IModelKey):Promise<M> {
		return null
	}
}
