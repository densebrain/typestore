import {Log,FinderRequest,FinderResultArray,isFunction} from 'typestore'


import {
	IPouchDBFullTextFinderOptions, IPouchDBFilterFinderOptions, IPouchDBFnFinderOptions,
	IPouchDBMangoFinderOptions
} from './PouchDBDecorations'
import {PouchDBRepoPlugin} from './PouchDBRepoPlugin'
import {getIndexByNameOrFields, makeMangoIndex} from './PouchDBIndexes'
import {mapDocs, transformDocumentKeys, mapAttrsToField} from './PouchDBUtil'


const log = Log.create(__filename)

function enableQuickSearch() {
	require('./PouchDBSetup').enableQuickSearch()
}

/**
 * Map docs to results
 *
 * @param pouchRepo
 * @param results
 * @param request
 * @param limit
 * @param offset
 * @param includeDocs
 * @returns {FinderResultArray<any>}
 */
function makeFinderResults(pouchRepo,results,request,limit:number,offset:number,includeDocs:boolean) {
	const
		items = mapDocs(pouchRepo,pouchRepo.repo.modelClazz,results,includeDocs),
		total = results.total_rows || items.length

	return new FinderResultArray<any>(items,total,request,results.metadata || [])
}

/**
 * Execute pouchdb.search
 *
 * @param pouchRepo
 * @param text
 * @param fields
 * @param limit
 * @param offset
 * @param includeDocs
 * @returns {any}
 */
export async function findWithText(pouchRepo,text:string,fields:string[],limit = -1,offset = -1,includeDocs = true) {
	enableQuickSearch()

	const attrFields = mapAttrsToField(fields)
	const opts:any = {
		query:text,
		fields: attrFields,
		include_docs: includeDocs,
		filter: (doc) => {
			//log.info('filtering full text',doc)
			return doc.type === pouchRepo.modelType.name
		}
	}

	if (limit > 0) {
		opts.limit = limit
	}

	if (offset > 0) {
		opts.skip = offset
	}

	log.debug('Querying full text with opts',opts)
	const result = await pouchRepo.db.search(opts)

	log.debug(`Full-Text search result`,result)
	return result.rows.reduce((finalResults,nextRow) => {
		const val = (includeDocs) ? nextRow.doc : nextRow.id

		finalResults.docs.push(val)
		finalResults.metadata.push({score:nextRow.score})

		return finalResults
	},{
		docs:[],
		metadata:[]
	})
}


/**
 * Execute pouchdb-find selector
 *
 * @param pouchRepo
 * @param selector
 * @param sort
 * @param limit
 * @param offset
 * @param includeDocs
 * @returns {any}
 * @param sortDirection
 * @param fields
 */
export async function findWithSelector(
	pouchRepo:PouchDBRepoPlugin<any>,
	selector,
	fields:string[] = null,
	sort:string[] = null,
	sortDirection:'asc'|'desc' = 'asc',
	limit = -1,
	offset = -1,
	includeDocs = true
) {

	const opts = {
		selector: Object.assign({
			type: pouchRepo.modelType.name
		},transformDocumentKeys(selector || {}))
	} as any

	if (sort)
		opts.sort = transformDocumentKeys(sort)
			.map(sortField => ({[sortField]:sortDirection}))

	if (limit > -1)
		opts.limit = limit

	if (offset > -1)
		opts.skip = offset

	if (includeDocs === false)
		opts.fields = (fields) ? mapAttrsToField(fields) : mapAttrsToField([pouchRepo.primaryKeyField])


	log.debug('findWithSelector, selector',selector,'opts',JSON.stringify(opts,null,4))
	const results = await pouchRepo.db.find(opts)
	log.debug('RESULTS: findWithSelector, selector',selector,'opts',JSON.stringify(opts,null,4),'results',results)

	return results
}


/**
 * Create a full text finder for Pouch
 *
 * @param pouchRepo
 * @param finderKey
 * @param opts
 * @returns {(request:FinderRequest, args:...[any])=>Promise<FinderResultArray>}
 */
export function makeFullTextFinder(pouchRepo:PouchDBRepoPlugin<any>,finderKey:string,opts:IPouchDBFullTextFinderOptions) {
	enableQuickSearch()
	let {textFields,queryMapper,build,minimumMatch,limit,offset,includeDocs} = opts

	/**
	 * Create full text index before hand
	 * unless explicitly disabled
	 *
	 * @type {Promise<boolean>}
	 */
	const buildIndexPromise = (build !== false) ? pouchRepo.db.search({
		fields:textFields,
		build:true
	}) : Promise.resolve(false)

	return async (request:FinderRequest,...args) => {
		await buildIndexPromise

		const query = (queryMapper) ?
			queryMapper(...args) :
			args[0]

		// Update params with the request if provided
		if (request) {
			offset = request.offset || offset
			limit = request.limit || limit
			includeDocs = (typeof request.includeModels === 'boolean') ?
				request.includeModels :
				includeDocs
		}

		const results = await findWithText(
			pouchRepo,query,textFields,limit,offset,includeDocs
		)

		log.debug('Full text result for ' + finderKey ,results,'args',args)

		return makeFinderResults(pouchRepo,results,request,limit,offset,includeDocs)



	}
}

/**
 * Create an al docs filter finder
 *
 * @param pouchRepo
 * @param finderKey
 * @param opts
 * @returns {(request:FinderRequest, args:...[any])=>Promise<any>}
 */
export function makeFilterFinder(pouchRepo:PouchDBRepoPlugin<any>,finderKey:string,opts:IPouchDBFilterFinderOptions) {
	log.warn(`Finder '${finderKey}' uses allDocs filter - THIS WILL BE SLOW`)

	const {filter} = opts

	return async (request:FinderRequest,...args) => {
		const allModels = await pouchRepo.all()
		return allModels.filter((doc) => filter(doc,...args))
	}
}

/**
 * Create a raw function finder
 *
 * @param pouchRepo
 * @param finderKey
 * @param opts
 * @returns {(request:FinderRequest, args:...[any])=>Promise<FinderResultArray>}
 */
export function makeFnFinder(pouchRepo:PouchDBRepoPlugin<any>,finderKey:string,opts:IPouchDBFnFinderOptions) {
	const {fn} = opts

	return async (request:FinderRequest,...args) => {
		const result = await fn(pouchRepo, ...args)
		return makeFinderResults(pouchRepo,result,request,opts.limit,opts.offset,opts.includeDocs)
	}
}

/**
 * Create a mango selector based finder
 * via pouchdb-find
 *
 * @param pouchRepo
 * @param finderKey
 * @param opts
 * @returns {(request:FinderRequest, args:...[any])=>Promise<Promise<FinderResultArray>>}
 */
export function makeMangoFinder(pouchRepo:PouchDBRepoPlugin<any>,finderKey:string,opts:IPouchDBMangoFinderOptions) {
	/**
	 *
	 */
	let {selector,sort,sortDirection,limit,offset,includeDocs,all,indexName,indexDirection,indexFields} = opts

	let indexReady = all === true
	let indexCreate = null

	// Create index promise
	if (all) {
		indexCreate = Promise.resolve(null)
	} else {
		if (!(indexName || indexFields))
			throw new Error("You MUST provide either indexFields or indexName")

		if (!(indexName || finderKey))
			throw new Error(`No valid index name indexName(${indexName}) / finderKey(${finderKey}`)

		// In the background create a promise for the index
		//const indexDeferred = Bluebird.defer()

		indexName = indexName || `idx_${pouchRepo.modelType.name}_${finderKey}`

		indexCreate = (async () => {
			let idx = await getIndexByNameOrFields(pouchRepo.db,indexName,indexFields)

			log.debug(`found index for finder ${finderKey}: ${idx && idx.name}/${indexName} with fields ${idx && idx.fields.join(',')}`)

			if (!(idx || (indexFields && indexFields.length > 0)))
				throw new Error(`No index found for ${indexName} and no indexFields provided`)

			if (!idx || idx.name === indexName) {
				idx = await makeMangoIndex(
					pouchRepo.store.db,
					pouchRepo.modelType.name,
					indexName || finderKey,
					indexDirection,
					indexFields || []
				)

				indexReady = true
			}

			return idx
		})()

	}

	// Actual finder function
	const finder = async (request:FinderRequest,...args) => {

		const selectorResult =
			isFunction(selector) ? (selector as any)(...args) : selector


		if (request) {
			offset = request.offset || offset
			limit = request.limit || limit
			sort = request.sort || sort
			sortDirection = request.sortDirection || sortDirection
			includeDocs = (typeof request.includeModels === 'boolean') ?
				request.includeModels :
				includeDocs
		}

		const result = await findWithSelector(
			pouchRepo,
			selectorResult,
			(request && request.extra) ? request.extra.fields : null,
			sort,
			sortDirection,
			limit,
			offset,
			includeDocs
		)

		return makeFinderResults(pouchRepo,result,request,limit,offset,includeDocs)

	}

	// Wrapped finder function, first make sure the index is ready
	return async (request:FinderRequest,...args) => {

		if (!indexReady) {
			log.debug(`Executing finder ${finderKey} with index ${indexName}`)
			const idx = await indexCreate
			log.debug('Index is Ready', idx)
		}
		return finder(request,...args)
	}

}