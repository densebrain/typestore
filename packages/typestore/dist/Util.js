"use strict";
var PluginTypes_1 = require("./PluginTypes");
function isFunction(o) {
    return typeof o === 'function';
}
exports.isFunction = isFunction;
/**
 * Check the type of a plugin
 *
 * @param plugin
 * @param type
 * @returns {boolean}
 */
function isPluginOfType(plugin, type) {
    return plugin.type && plugin.type === type;
}
exports.isPluginOfType = isPluginOfType;
function isRepoPlugin(plugin) {
    return isPluginOfType(plugin, PluginTypes_1.PluginType.Repo);
}
exports.isRepoPlugin = isRepoPlugin;
function isStorePlugin(plugin) {
    return isPluginOfType(plugin, PluginTypes_1.PluginType.Store);
}
exports.isStorePlugin = isStorePlugin;
function isIndexerPlugin(plugin) {
    return isPluginOfType(plugin, PluginTypes_1.PluginType.Indexer);
}
exports.isIndexerPlugin = isIndexerPlugin;
function isFinderPlugin(plugin) {
    return isPluginOfType(plugin, PluginTypes_1.PluginType.Finder);
}
exports.isFinderPlugin = isFinderPlugin;
function PluginFilter(plugins, type) {
    return plugins.filter((type == PluginTypes_1.PluginType.Repo) ? isRepoPlugin :
        (type == PluginTypes_1.PluginType.Store) ? isStorePlugin :
            (type == PluginTypes_1.PluginType.Indexer) ? isIndexerPlugin :
                isFinderPlugin);
}
exports.PluginFilter = PluginFilter;

//# sourceMappingURL=Util.js.map
