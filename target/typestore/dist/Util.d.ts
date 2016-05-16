import { IPlugin, IRepoPlugin, PluginType, IStorePlugin, IIndexerPlugin, IFinderPlugin, IRepoSupportPlugin } from "./Types";
import { Repo } from "./Repo";
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
export declare function PromiseMap<T>(values: T[], mapper: (value: T) => any): Promise<any[]>;
export declare function PluginFilter<P extends IPlugin>(plugins: IPlugin[], type: PluginType): P[];
export declare function isInstanceType<T>(val: any, type: {
    new (): T;
}): val is T;
export declare function includesUnlessEmpty(arr: any[], val: any): boolean;
export declare function repoAttachIfSupported(repo: Repo<any>, plugin: IRepoSupportPlugin): Repo<any>;
