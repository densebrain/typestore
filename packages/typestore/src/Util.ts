import {IPlugin, IRepoPlugin, PluginType, IStorePlugin,
	IIndexerPlugin, IFinderPlugin,IRepoSupportPlugin} from "./Types"
import {Repo} from "./Repo"

function isTypeOf(o,typeStr) {
	return typeof o === typeStr
}

export function isFunction(o:any):o is Function {
	return isTypeOf(o,'function')
}

export function isNumber(o:any):o is number {
	return isTypeOf(o,'number')
}

export function isString(o:any):o is string {
	return isTypeOf(o,'string')
}

export function isNumberOrString(o:any):o is string|number {
	return isString(o) || isNumber(o)
}

export function isArrayType(type:any):boolean {
	return type === Array ||
		type instanceof Array ||
		typeof type === 'array' ||
		Array.isArray(type)
}

/**
 * Check the type of a plugin
 *
 * @param plugin
 * @param type
 * @returns {boolean}
 */
export function isPluginOfType(plugin:IPlugin,type:PluginType):boolean {
	return plugin.type && (plugin.type & type) > 0
}

export function isRepoPlugin(plugin:IPlugin):plugin is IRepoPlugin<any> {
	return isPluginOfType(plugin,PluginType.Repo)
}

export function isStorePlugin(plugin:IPlugin):plugin is IStorePlugin {
	return isPluginOfType(plugin,PluginType.Store)
}

export function isIndexerPlugin(plugin:IPlugin):plugin is IIndexerPlugin {
	return isPluginOfType(plugin,PluginType.Indexer)
}

export function isFinderPlugin(plugin:IPlugin):plugin is IFinderPlugin {
	return isPluginOfType(plugin,PluginType.Finder)
}

export async function PromiseMap<T>(values:T[],mapper:(value:T) => any):Promise<any[]> {
	const results = values.map(async (value) => await Promise.resolve(mapper(value)))
	return await Promise.all(results)
}

export function PluginFilter<P extends IPlugin>(plugins:IPlugin[],type:PluginType):P[] {
	return plugins.filter(
		(type == PluginType.Repo) ? isRepoPlugin :
			(type == PluginType.Store) ? isStorePlugin :
				(type == PluginType.Indexer) ? isIndexerPlugin :
					isFinderPlugin

	) as P[]
}


export function isInstanceType<T>(val:any,type:{new():T}):val is T {
	return val instanceof type
}

export function includesUnlessEmpty(arr:any[],val:any):boolean {
	return arr.length === 0 || arr.includes(val)
}

export function repoAttachIfSupported(repo:Repo<any>,plugin:IRepoSupportPlugin) {
	return (includesUnlessEmpty(plugin.supportedModels,repo.modelClazz)) ?
		plugin.initRepo(repo) : null
}