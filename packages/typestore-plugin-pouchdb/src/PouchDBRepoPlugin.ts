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
	isFunction
} from 'typestore'

import {enableQuickSearch} from './PouchDBSetup'
import {makeMangoIndex,getIndexByNameOrFields} from './PouchDBIndexes'
import {PouchDBPlugin} from "./PouchDBPlugin";
import {PouchDBAttributePrefix,PouchDBOperators}
	from "./PouchDBConstants";

import {
	IPouchDBMangoFinderOptions,
	IPouchDBFilterFinderOptions,
	IPouchDBFnFinderOptions,
	IPouchDBFullTextFinderOptions
} from './PouchDBDecorations'

import {mapAttrsToField} from './PouchDBUtil'

const log = Log.create(__filename)

/**
 * Prepends all keys - DEEP
 * with `attrs.` making field reference easier
 * @param o
 * @returns {{}}
 */
function transformDocumentKeys(o) {
	return (Array.isArray(o)) ?
		o.map(aVal => transformDocumentKeys(aVal)) :
			(typeof o === "object") ?
				Object
					.keys(o)
					.reduce((newObj,nextKey) => {
						const nextVal = o[nextKey]

						nextKey = PouchDBOperators.includes(nextKey) ?
							nextKey : `${PouchDBAttributePrefix}${nextKey}`

						newObj[nextKey] = transformDocumentKeys(nextVal)

						return newObj
					},{}) :
				o

}
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

	makeFullTextFinder(finderKey:string,opts:IPouchDBFullTextFinderOptions) {
		enableQuickSearch()
		let {textFields,queryMapper,build,minimumMatch,limit,offset} = opts

		return (...args) => {
			const query = (queryMapper) ?
				queryMapper(...args) :
				args[0]

			return this.findWithText(
				query,textFields,build,limit,offset,true)
				.then(result => {
					log.info('Full text result for ' + finderKey ,result,'args',args)
					return this.mapDocs(result)
				})


		}
	}

	makeFilterFinder(finderKey:string,opts:IPouchDBFilterFinderOptions) {
		log.warn(`Finder '${finderKey}' uses allDocs filter - THIS WILL BE SLOW`)

		const {filter} = opts

		return async (...args) => {
			const allModels = await this.all()
			return allModels.filter((doc) => filter(doc,...args))
		}
	}

	makeFnFinder(finderKey:string,opts:IPouchDBFnFinderOptions) {
		const {fn} = opts

		return async (...args) => {
			const result = await fn(this, ...args)
			return this.mapDocs(result)
		}
	}

	makeMangoFinder(finderKey:string,opts:IPouchDBMangoFinderOptions) {
		let {selector,sort,limit,indexName,indexFields} = opts
		assert((indexName || indexFields) && !(indexName && indexFields),
			"You MUST provide either indexFields or indexName")

		assert(indexName || finderKey,`No valid index name indexName(${indexName}) / finderKey(${finderKey}`)

		// In the background create a promise for the index
		//const indexDeferred = Bluebird.defer()
		let indexReady = false
		indexName = indexName || `idx_${finderKey}`

		const indexCreate = () => getIndexByNameOrFields(this.db,indexName,indexFields)
			.then(idx => {
				assert(idx || (indexFields && indexFields.length > 0),
					`No index found for ${indexName} and no indexFields provided`)

				return (!idx || idx.name === indexName) ?
					makeMangoIndex(
						this.store.db,
						this.modelType.name,
						indexName || finderKey,
						indexFields || []
					).then(finalIdx => {
						log.info('Index result received',finalIdx)
						indexReady = true

						return finalIdx
					}) :
					idx

				// try {
				// 	const idx = await
				// 	indexDeferred.resolve(idx)
				// } catch (err) {
				// 	log.error(`Failed to create index for finder ${finderKey}`,err)
				// 	indexDeferred.reject(err)
				// }
			})

		const finder = (...args) => {
			const selectorResult =
				isFunction(selector) ? selector(...args) :
					selector

			return this.findWithSelector(
				selectorResult,
				sort,
				limit).then(result => this.mapDocs(result))

		}

		return (...args) => {
			if (!indexReady) {
				log.info('index is not ready')
				return indexCreate()
					.then((idx) => {
						log.info('Index is Ready')
						return finder(...args)
					})
			} else {
				return finder(...args) as any
			}
		}

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
		const opts = getFinderOpts(repo,finderKey) as
			IPouchDBFnFinderOptions &
			IPouchDBFilterFinderOptions &
			IPouchDBMangoFinderOptions &
			IPouchDBFullTextFinderOptions

		if (!opts )
			return null

		const {
			fn,
			filter,
			selector,
			sort,
			limit,
			single,
			textFields,
		} = opts

		assert(fn || selector || filter || textFields,'selector or fn properties MUST be provided on an pouchdb finder descriptor')

		const finderFn:any = (selector) ? this.makeMangoFinder(finderKey,opts) :
			(filter) ? this.makeFilterFinder(finderKey,opts) :
				(textFields) ? this.makeFullTextFinder(finderKey,opts) :
					this.makeFnFinder(finderKey,opts)

		return (...args) => {
			return finderFn(...args)
				.then((models) => {
					log.info('Got finder result for ' + finderKey,'args',args,'models',models)
					return (single) ? models[0] : models
				})
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

	findWithText(text:string,fields:string[],build = true,limit = -1,offset = -1,includeDocs = true) {
		enableQuickSearch()

		const attrFields = mapAttrsToField(fields)
		const opts:any = {
			query:text,
			fields: attrFields,
			include_docs: includeDocs,
			filter: (doc) => {
				log.info('filtering full text',doc)
				return doc.type === this.modelType.name
			}
		}

		if (limit > 0) {
			opts.limit = limit
		}

		if (offset > 0) {
			opts.skip = offset
		}

		log.info('Querying full text with opts',opts)
		return this.db.search(opts)
			.then(result => {
				log.debug(`Full-Text search result`,result)
				return result.rows.map(row => row.doc)
			})

	}

	findWithSelector(selector,sort = null,limit = -1,offset = -1,includeDocs = true) {

		const opts = {
			selector: Object.assign({
				type: this.modelType.name
			},transformDocumentKeys(selector))
		} as any

		if (sort)
			opts.sort = transformDocumentKeys(sort)

		if (limit > -1)
			opts.limit = limit

		if (offset > -1)
			opts.offset = offset

		log.debug('findWithSelector, selector',selector,'opts',JSON.stringify(opts,null,4))

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