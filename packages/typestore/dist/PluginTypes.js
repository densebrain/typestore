"use strict";
require('reflect-metadata');
/**
 * Model persistence events
 */
(function (ModelEvent) {
    ModelEvent[ModelEvent["PreSave"] = 0] = "PreSave";
    ModelEvent[ModelEvent["PostSave"] = 1] = "PostSave";
    ModelEvent[ModelEvent["PreRemove"] = 2] = "PreRemove";
    ModelEvent[ModelEvent["PostRemove"] = 3] = "PostRemove";
})(exports.ModelEvent || (exports.ModelEvent = {}));
var ModelEvent = exports.ModelEvent;
/**
 * Different indexing actions
 */
(function (IndexAction) {
    IndexAction[IndexAction["Add"] = 0] = "Add";
    IndexAction[IndexAction["Update"] = 1] = "Update";
    IndexAction[IndexAction["Remove"] = 2] = "Remove";
})(exports.IndexAction || (exports.IndexAction = {}));
var IndexAction = exports.IndexAction;
/**
 * Super simply default key mapper for search results
 * field names in, key out, must all be top level in result object
 *
 * @param fields
 * @returns {function(Repo<any>, {new(): R}, R): IModelKey}
 * @constructor
 */
function DefaultKeyMapper() {
    var fields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fields[_i - 0] = arguments[_i];
    }
    return function (repo, resultType, result) {
        var values = fields.map(function (field) { return result[field]; });
        return repo.key(values);
    };
}
exports.DefaultKeyMapper = DefaultKeyMapper;
(function (PluginType) {
    PluginType[PluginType["Indexer"] = 0] = "Indexer";
    PluginType[PluginType["Store"] = 1] = "Store";
    PluginType[PluginType["Repo"] = 2] = "Repo";
    PluginType[PluginType["Finder"] = 3] = "Finder";
})(exports.PluginType || (exports.PluginType = {}));
var PluginType = exports.PluginType;

//# sourceMappingURL=PluginTypes.js.map
