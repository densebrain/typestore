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
	IModelMapper,
	ModelPersistenceEventType,
	getFinderOpts,
	assert,
	Log,
	IModelAttributeOptions,
	FinderRequest,
	getDefaultMapper,
	IModelType,
	IModelOptions,
	FinderResultArray
} from 'typestore'

import * as Bluebird from 'bluebird'
import { PouchDBPlugin } from "./PouchDBPlugin";

import {
	IPouchDBMangoFinderOptions,
	IPouchDBFilterFinderOptions,
	IPouchDBFnFinderOptions,
	IPouchDBFullTextFinderOptions,
	IPouchDBModelOptions,
	IPouchDBPrefixFinderOptions
} from './PouchDBDecorations'

import { mapDocs, convertModelToDoc, dbKeyFromObject } from './PouchDBUtil'
import {
	makeFinderResults,
	makeMangoFinder,
	makePrefixFinder,
	makeFilterFinder,
	makeFnFinder,
	makeFullTextFinder
} from './PouchDBFinders'


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

/**
 * PouchDB repo plugin
 */
export class PouchDBRepoPlugin<M extends IModel> implements IRepoPlugin<M>, IFinderPlugin {
	
	readonly type = PluginType.Repo | PluginType.Finder
	
	/**
	 * The model type supported
	 */
	readonly modelType:IModelType
	
	get modelOptions():IPouchDBModelOptions {
		return this.modelType.options
	}
	
	readonly supportedModels:any[]
	
	/**
	 * ref to coordinator
	 */
	private coordinator
	
	/**
	 * ref to primary key attr
	 */
	private primaryKeyAttr:IModelAttributeOptions
	
	/**
	 * primary key field
	 */
	primaryKeyField:string
	primaryKeyType:any
	
	
	/**
	 * Construct a new repo/store
	 * manager for a given repo/model
	 *
	 * @param store
	 * @param repo
	 */
	constructor(public store:PouchDBPlugin, public repo:Repo<M>) {
		this.supportedModels = [ repo.modelClazz ]
		this.modelType = this.repo.modelType
		this.primaryKeyAttr = this.modelType.options.attrs
			.find(attr => attr.primaryKey)
		
		this.primaryKeyField = this.primaryKeyAttr.name
		this.primaryKeyType = this.primaryKeyAttr.type
		
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
		
		// Get the finder opts 1st
		const opts = getFinderOpts(repo, finderKey) as
			IPouchDBFnFinderOptions &
				IPouchDBFilterFinderOptions &
				IPouchDBMangoFinderOptions &
				IPouchDBFullTextFinderOptions &
				IPouchDBPrefixFinderOptions
		
		if (!opts)
			return null
		
		const
			{
				fn, filter, selector,
				keyProvider,
				sort, limit, single,
				textFields, all
			} = opts
		
		assert(all || keyProvider || fn || selector || filter || textFields, 'selector or fn properties MUST be provided on an pouchdb finder descriptor')
		
		const
			finderFn:any = (selector || all) ? makeMangoFinder(this, finderKey, opts) :
				(keyProvider) ? makePrefixFinder(this, finderKey, opts) :
					(filter) ? makeFilterFinder(this, finderKey, opts) :
						(textFields) ? makeFullTextFinder(this, finderKey, opts) :
							makeFnFinder(this, finderKey, opts)
		
		return async(...args) => {
			const
				request:FinderRequest = (args[ 0 ] instanceof FinderRequest) ? args[ 0 ] : null
			
			if (request)
				args.shift()
			
			const
				models = await finderFn(request, ...args)
			
			//log.debug('Got finder result for ' + finderKey,'args',args,'models',models)
			return (single) ? models[ 0 ] : models
			
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
	 */
	get db() {
		return this.store.getDB(this)
	}
	
	
	async init(coordinator:ICoordinator, opts:ICoordinatorOptions):Promise<ICoordinator> {
		return (this.coordinator = coordinator)
	}
	
	/**
	 * Start the repo plugin
	 *
	 * @returns {any}
	 */
	async start():Promise<ICoordinator> {
		await this.store.open(this.modelType)
		
		return this.coordinator
	}
	
	/**
	 * Stop the repo plugin
	 *
	 * @returns {any}
	 */
	async stop():Promise<ICoordinator> {
		return this.coordinator
	}
	
	key(...args):PouchDBKeyValue {
		return new PouchDBKeyValue(...args);
	}
	
	private extractKeyValue(val:PouchDBKeyValue|any):any {
		val = (val && val.pouchDBKey) ? val.args[ 0 ] : val
		if (typeof val !== 'string')
			val = `${val}`
		return val
	}
	
	async get(key:PouchDBKeyValue):Promise<M> {
		if (!key)
			throw new Error('key can not be undefined or falsy')
		key = this.extractKeyValue(key)
		
		//const result = await findWithSelector(this,{[this.primaryKeyAttr.name]: key})
		const result = await Bluebird.resolve(this.db.get(key))
			.then(doc => {
				return doc
			})
			.catch(err => {
				if (err.status === 404)
					return null
				
				throw err
			})
		
		if (!result)
			return null
		
		const mapper = getDefaultMapper(this.repo.modelClazz)
		return mapper.fromObject(result.attrs, (o, model:any) => {
			const $$doc = Object.assign({}, result)
			delete $$doc[ 'attrs' ]
			
			model.$$doc = $$doc
			
			return model
		})
		
	}
	
	
	/**
	 * Retrieve the rev for a model id
	 *
	 * @param id
	 * @returns {null}
	 */
	async getRev(id:any):Promise<string> {
		const model:any = await this.get(id)
		return (model) ? model.$$doc._rev : null
	}
	
	async save(model:M):Promise<M> {
		const mapper = this.mapper
		const
			json = mapper.toObject(model)
		
		const doc = convertModelToDoc(
			this,
			this.modelType,
			mapper,
			this.primaryKeyAttr.name,
			model
		)
		
		const
			id = dbKeyFromObject(this,this.primaryKeyAttr.name,model)// model[ this.primaryKeyAttr.name ]
		
		if (id && doc._id && !doc._rev) {
			const
				rev = await this.getRev(doc._id)
			
			if (rev) {
				doc._rev = rev
			}
		}
		
		
		try {
			const res:any = await this.db[ doc._id ? 'put' : 'post' ](doc)
			
			const savedModel = Object.assign({}, model, { $$doc: { _id: res.id, '_rev': res.rev, attrs: json } })
			
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Save, savedModel)
			
			return savedModel as M
			
		} catch (err) {
			log.error('Failed to persist model', err)
			log.error('Failed persisted json', json, model)
			
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
		
		
		const
			model = await this.get(key)
		
		if (!model)
			return null
		
		const
			result = await this.db.remove((model as any).$$doc)
		
		if (this.repo.supportPersistenceEvents())
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Remove, model)
		
		return result
	}
	
	/**
	 * Get count using the type indexes in db open
	 *
	 * @returns {Promise<number>}
	 */
	count():Promise<number> {
		return this.store.getModelCount(this.modelType.name, this)
	}
	
	/**
	 * Get all documents
	 *
	 * @param request - for finder options
	 * @param includeDocs - if true complete docs are returned - otherwise just ids
	 * @param startkey - start with key (if provided, endkey is required too
	 * @param endkey
	 */
	async all(request:FinderRequest, includeDocs = true, startkey:string = null, endkey:string = null) {
		assert((!startkey && !endkey) || (startkey && endkey), `Either provide start key and end key or neither`)
		
		const
			keyOpts = !startkey ? {} : { startkey, endkey },
			opts = Object.assign({
				include_docs: includeDocs
			}, keyOpts),
			{ limit, offset } = request || ({} as FinderRequest)
		
		if (limit && limit > 0) {
			opts.limit = limit
		}
		
		if (offset && offset > 0) {
			opts.skip = offset
		}
		
		//noinspection UnnecessaryLocalVariableJS
		const
			result = await this.db.allDocs(opts),
			
			// Now reduce the docs, filtering by type
			
			docs = result
				.rows
				.reduce((allDocs, nextRow) => {
					// Filter other types or special docs here
					if (includeDocs) {
						if (nextRow.doc.type === this.modelType.name)
							allDocs.push(nextRow.doc)
					} else {
						allDocs.push(nextRow.id)
					}
					return allDocs
				}, [])
		
		
		result.rows = docs
		
		
		return makeFinderResults(this, result, request, limit, offset, includeDocs)
		
		//return mapDocs(this,this.repo.modelClazz,docs,includeDocs)
	}
	
	/**
	 * Bulk get
	 *
	 * @param keys
	 * @returns {any}
	 */
	async bulkGet(...keys:PouchDBKeyValue[]):Promise<M[]> {
		keys = keys.map(key => (key.pouchDBKey) ? key.args[ 0 ] : key)
		
		return await Promise.all(keys.map(key => this.get(key)))
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
		
		// Models -> Docs
		const docs = models.map(model => convertModelToDoc(
			this,
			this.modelType,
			mapper,
			this.primaryKeyAttr.name,
			model
		))
		
		// Find all docs that have _id and not _rev
		const
			revPromises = [],
			missingRefs = await this.db.allDocs({
				include_docs: false,
				keys: docs.filter(doc => doc._id && !doc._rev)
					.map(doc => doc._id)
			})
		
		missingRefs.rows
			.filter(row => !row.error && row.value && row.value.rev)
			.forEach(row => {
				const
					id = row.id, rev = row.value.rev,
					doc = docs.find(doc => `${doc._id}` === `${id}`)
				doc._rev = rev
			})
		
		
		const
			// Save all docs
			responses = await this.db.bulkDocs(docs),
			
			// Map Docs -> Models
			savedModels = docs.map((doc, index) => {
				const savedModel = mapper.fromObject(doc.attrs)
				
				const res = responses[ index ]
				Object.assign(savedModel as any, {
					$$doc: {
						_id: res.id,
						_rev: res.rev,
						attrs: doc.attrs
					}
				})
				
				return savedModel
			})
		
		if (this.repo.supportPersistenceEvents())
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Save, ...savedModels)
		
		return savedModels
	}
	
	/**
	 * Bulk remove
	 *
	 * @param keys
	 * @returns {PouchDBKeyValue[]}
	 */
	async bulkRemove(...keys:PouchDBKeyValue[]):Promise<any[]> {
		keys = keys.map(key => (key.pouchDBKey) ? key.args[ 0 ] : key)
		
		let
			models = null
		
		if (this.repo.supportPersistenceEvents())
			models = await this.bulkGet(...keys)
		
		
		// Get the revs for the keys
		const
			deleteDocs:any[] = keys.map(_id => ({ _id, _deleted: true })),
			deleteRevs = await this.db.allDocs({
				include_docs: false,
				keys
			})
		
		// Map to delete docs
		deleteRevs.rows
			.filter(row => !row.error && row.value && row.value.rev)
			.forEach(row => {
				const
					id = row.id,
					doc = deleteDocs.find(doc => `${doc._id}` === `${id}`)
				
				doc._rev = row.value.rev
			})
		
		// Bulk docs
		await this.db.bulkDocs(deleteDocs)
		
		if (models)
			this.repo.triggerPersistenceEvent(ModelPersistenceEventType.Remove, ...models)
		
		return keys
	}
	
}