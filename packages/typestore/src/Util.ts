import {IPlugin, IRepoPlugin, PluginType, IStorePlugin, IIndexerPlugin, IFinderPlugin} from "./PluginTypes";

export function isFunction(o:any):o is Function {
	return typeof o === 'function'
}

/**
 * Check the type of a plugin
 * 
 * @param plugin
 * @param type
 * @returns {boolean}
 */
export function isPluginOfType(plugin:IPlugin,type:PluginType):boolean {
	return plugin.type && plugin.type === type
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


export function PluginFilter<P extends IPlugin>(plugins:IPlugin[],type:PluginType):P[] {
	return plugins.filter(
		(type == PluginType.Repo) ? isRepoPlugin :
			(type == PluginType.Store) ? isStorePlugin :
				(type == PluginType.Indexer) ? isIndexerPlugin :
					isFinderPlugin
				
	) as P[]
}

