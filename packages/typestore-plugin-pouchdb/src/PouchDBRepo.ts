import { IModel, Repo } from "typestore"

/**
 * Extended api for PouchDBRepo
 */
export class PouchDBRepo<M extends IModel> extends Repo<M> {
	
	
	constructor(repoClazz:any,modelClazz:{new ():M;}) {
		super(repoClazz,modelClazz)
	}
	
	getPouchDB() {
		return (this as any).pouchDB
	}
	
	getModelFromObject(val:any) {
		return (this as any).modelFromObject(val)
	}
}
