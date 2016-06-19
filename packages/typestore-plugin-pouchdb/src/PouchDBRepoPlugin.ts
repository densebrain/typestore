//import * as PouchDB from 'pouchdb'

import {
	IRepoPlugin,
	IKeyValue,
	PluginType,
	IModel,
	Repo,
	ICoordinator,
	ICoordinatorOptions,
	PluginEventType,
	IFinderPlugin,
	getMetadata,
	IModelMapper,
	ModelPersistenceEventType,
	assert,
	Log
} from 'typestore'

import {PouchDBPlugin} from "./PouchDBPlugin";
import {PouchDBAttributePrefix,PouchDBFinderKey} from "./PouchDBConstants";
import {IPouchDBFinderOptions} from './PouchDBDecorations'

const log = Log.create(__filename)

/**
 * Super simple plain jain key for now
 * what you send to the constructor comes out the
 * other end
 *
 * just like poop!
 */
export class PouchDBKeyValue implements IKeyValue {

	public args:any[]

	pouchDBKey = true

	constructor(...args:any[]) {
		this.args = args
	}
}

export class PouchDBRepoPlugin<M extends IModel> implements IRepoPlugin<M>, IFinderPlugin {

	type = PluginType.Repo | PluginType.Finder
	supportedModels:any[]

	private coordinator
	private modelType
	private primaryKeyAttr:string

	/**
	 * Construct a new repo/store
	 * manager for a given repo/model
	 *
	 * @param store
	 * @param repo
	 */
	constructor(private store:PouchDBPlugin, public repo:Repo<M>) {
		this.supportedModels = [repo.modelClazz]
		this.modelType = this.repo.modelType
		this.primaryKeyAttr = this.modelType.options.attrs
			.filter(attr => attr.primaryKey)
			.map(attr => attr.name)[0]


		repo.attach(this)
	}



	/**
	 * Create a finder method with descriptor
	 * and signature
	 *
	 * @param repo
	 * @param finderKey
	 * @returns {any}
	 */
	decorateFinder(repo:Repo<any>, finderKey:string) {
		const finderOpts = getMetadata(
			PouchDBFinderKey,
			this.repo,
			finderKey
		) as IPouchDBFinderOptions

		if (!finderOpts)
			return null

		const {
			fn,
			filter,
			selector,
			sort,
			limit,
			singleResult
		} = finderOpts

		assert(fn || selector || filter,'selector or fn properties MUST be provided on an pouchdb finder descriptor')

		return async(...args) => {

			let result = null,mappedResults = null
			if (selector) {
				result = this.findWithSelector(selector(...args),sort,limit)
			} else if (fn) {
				result = await fn(this, ...args)
			} else if (filter) {
				mappedResults = await this.all()
				mappedResults = mappedResults
					.filter((doc) => filter(doc,...args))
			}

			if (!mappedResults)
				mappedResults = this.mapDocs(result)

			return singleResult ? mappedResults[0] : mappedResults
		}
	}

	/**
	 * Handle a plugin event
	 *
	 * @param eventType
	 * @param args
	 * @returns {boolean}
	 */
	handle(eventType:PluginEventType, ...args):boolean|any {
		return false;
	}

	/**
	 * Model mapper
	 *
	 * @returns {IModelMapper<M>}
	 */
	get mapper():IModelMapper<M> {
		return this.repo.getMapper(this.repo.modelClazz)
	}

	/**
	 * Get db ref
	 *
	 * @returns {Dexie}
	 */
	get db() {
		return this.store.db
	}


	async init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		return (this.coordinator = coordinator)
	}

	async start():Promise<ICoordinator> {
		return this.coordinator
	}

	async stop():Promise<ICoordinator> {
		return this.coordinator
	}

	key(...args):PouchDBKeyValue {
		return new PouchDBKeyValue(...args);
	}


	keyFromObject(o:any):PouchDBKeyValue {
		return new PouchDBKeyValue(o[this.primaryKeyAttr])
	}

	dbKeyFromObject(o:any):string {
		const key = o[this.primaryKeyAttr]
		return (key) ? '' + key : null
	}

	dbKeyFromKey(key:PouchDBKeyValue) {
		return key.args[0]
	}

	private mapDocs(result:any):M[] {
		const mapper = this.repo.getMapper(this.repo.modelClazz)

		let docs = (result && Array.isArray(result)) ? result : result.docs
		docs = docs || []
		return docs.map(doc => mapper.fromObject(doc.attrs,(o, model) => {
			(model as any).$$doc = doc
			return model
		}))
	}

	findWithSelector(selector,sort = null,limit = -1,offset = -1,includeDocs = true) {
		selector = Object.keys(selector).reduce((newSelector,nextKey) => {
			const finalKey = !['$or','$and'].includes(nextKey) ?
				`${PouchDBAttributePrefix}${nextKey}` :
				nextKey

			newSelector[finalKey] = selector[nextKey]
			return newSelector
		},{})

		const opts = {
			selector: Object.assign({
				type: this.modelType.name,
				// attrs: selector
			},selector)
		} as any

		if (sort)
			opts.sort = sort

		if (limit > -1)
			opts.limit = limit

		if (offset > -1)
			opts.offset = offset

		// this.db.allDocs().then(allDocsResult => {
		// 	log.info('all docs',allDocsResult)
		// 	debugger
		// })
		//console.log('selector',JSON.stringify(opts.selector))

		return this.db.find(opts)
	}



	get(key:PouchDBKeyValue):Promise<M> {
		key = key.pouchDBKey ? key.args[0] : key

		return this.findWithSelector({[this.primaryKeyAttr]: key}).then((result) => {

			if (result && result.docs.length > 1)
				throw new Error(`More than one database object returned for key: ${key}`)

			return this.mapDocs(result)[0] as M
		})



	}

	async save(model:M):Promise<M> {
		const mapper = this.mapper
		const json = mapper.toObject(model)
		const doc = (model as any).$$doc || {} as any

		if (!doc._id) {
			const key = this.dbKeyFromObject(model)
			if (key)
				doc._id = key
		}



		doc.type = this.modelType.name
		doc.attrs = json

		try {
			const res:any = await this.db[doc._id ? 'put' : 'post'](doc)

			const savedModel = mapper.fromObject(json)
			Object.assign(savedModel as any,{$$doc: {_id: res.id, '_rev': res.rev,attrs:json}})

			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Save, savedModel)

			return savedModel as M

		} catch (err) {
			log.error('Failed to persist model',err)
			log.error('Failed persisted json',json,model)

			throw err
		}
	}

	/**
	 * Remove implementation
	 *
	 * @param key
	 * @returns {Promise<void>}
	 */
	async remove(key:PouchDBKeyValue):Promise<any> {
		key = key.pouchDBKey ? key : this.key(key as any)

		const model = await this.get(key)


		if (!model)
			return null

		const result = await this.db.remove((model as any).$$doc)

		if (this.repo.supportPersistenceEvents())
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Remove,model)

		return Promise.resolve(result);
	}

	//TODO: make count efficient
	async count():Promise<number> {
		const result = await this.all(false)
		return !result ? 0 : result.length

	}

	all(includeDocs = true) {
		//return this.findWithSelector({},null,null,null,includeDocs)
		return this.db.allDocs({include_docs:true})
			.then(result => {
				const docs = result.rows
					.reduce((allDocs,nextRow) => {
						allDocs.push(nextRow.doc)
						return allDocs
					},[])
					.filter(doc => doc.type === this.modelType.name)

				return this.mapDocs(docs)
			})
	}

	/**
	 * Bulk get
	 *
	 * @param keys
	 * @returns {any}
	 */
	async bulkGet(...keys:PouchDBKeyValue[]):Promise<M[]> {
		keys = keys.map(key => (key.pouchDBKey) ? key.args[0] : key)

		return await Promise.all(keys.map(key => this.get(key)))
		//const result
		// const result = await this.findWithSelector({
		// 	$or: keys.map(key => ({
		// 		[PouchDBAttributePrefix + this.primaryKeyAttr]: key
		// 	}))
		// })


		//return this.mapDocs(result) as M[]

	}

	/**
	 * Bulk save/put
	 *
	 * @param models
	 * @returns {M[]}
	 */
	async bulkSave(...models:M[]):Promise<M[]> {
		const mapper = this.repo.getMapper(this.repo.modelClazz)
		const jsons = []
		const docs = models.map(model => {
			const json = mapper.toObject(model)
			jsons.push(json)

			const doc = (model as any).$$doc || {} as any
			doc.type = this.modelType.name
			doc.attrs = json

			return doc
		})

		const responses = await this.db.bulkDocs(docs)

		const savedModels = jsons.map((json,index) => {
			const savedModel = mapper.fromObject(json)

			const res = responses[index]
			Object.assign(savedModel as any,{$$doc: {_id: res.id, '_rev': res.rev,attrs:json}})

			return savedModel
		})

		if (this.repo.supportPersistenceEvents())
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Save,...savedModels)

		return savedModels
	}

	/**
	 * Bulk remove
	 *
	 * @param keys
	 * @returns {PouchDBKeyValue[]}
	 */
	async bulkRemove(...keys:PouchDBKeyValue[]):Promise<any[]> {
		const models = await this.bulkGet(...keys)

		await Promise.all(models.map((model:any) => this.db.remove(model.$$doc)))

		if (this.repo.supportPersistenceEvents())
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Remove,...models)

		return keys
	}
}