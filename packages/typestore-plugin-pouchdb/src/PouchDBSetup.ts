/**
 * Import PouchDB
 */
import * as PouchDB from 'pouchdb'

// Tracks whether quick search is enabled
let quickSearchEnabled = false


/**
 * Add the find plugin / MANGO
 */
PouchDB.plugin(require('pouchdb-find'))

/**
 * Extend the DTS to include some more functions we
 * need to work with pouch
 */
declare global {
	interface PouchApi {
		createIndex: (obj:any,callback?:any) => Promise<any>
		deleteIndex: (obj:any,callback?:any) => Promise<any>
		getIndexes: (callback?:any) => Promise<any>
		find: (request:any,callback?:any) => Promise<any>
		search: (request:any,callback?:any) => Promise<any>
	}

	interface PouchDB {
		plugin: (plugin:any) => void
		debug:any
	}
}

/**
 * Enable quick search plugin
 */
export function enableQuickSearch() {
	if (quickSearchEnabled)
		return

	quickSearchEnabled = true
	PouchDB.plugin(require('pouchdb-quick-search'))
}

export {

}