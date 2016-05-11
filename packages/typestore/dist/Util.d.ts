import { IPlugin, IRepoPlugin, PluginType, IStorePlugin, IIndexerPlugin, IFinderPlugin } from "./PluginTypes";
export declare function isFunction(o: any): o is Function;
/**
 * Check the type of a plugin
 *
 * @param plugin
 * @param type
 * @returns {boolean}
 */
export declare function isPluginOfType(plugin: IPlugin, type: PluginType): boolean;
export declare function isRepoPlugin(plugin: IPlugin): plugin is IRepoPlugin<any>;
export declare function isStorePlugin(plugin: IPlugin): plugin is IStorePlugin;
export declare function isIndexerPlugin(plugin: IPlugin): plugin is IIndexerPlugin;
export declare function isFinderPlugin(plugin: IPlugin): plugin is IFinderPlugin;
export declare function PluginFilter<P extends IPlugin>(plugins: IPlugin[], type: PluginType): P[];
