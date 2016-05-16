"use strict";

require('reflect-metadata');
require('./Globals');
/**
 * Model persistence events
 */
(function (PluginEventType) {
    PluginEventType[PluginEventType["RepoInit"] = 1] = "RepoInit";
    PluginEventType[PluginEventType["ModelRegister"] = 2] = "ModelRegister";
})(exports.PluginEventType || (exports.PluginEventType = {}));
var PluginEventType = exports.PluginEventType;
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
    for (var _len = arguments.length, fields = Array(_len), _key = 0; _key < _len; _key++) {
        fields[_key] = arguments[_key];
    }

    return function (repo, resultType, result) {
        var values = fields.map(function (field) {
            return result[field];
        });
        return repo.key(values);
    };
}
exports.DefaultKeyMapper = DefaultKeyMapper;
(function (PluginType) {
    PluginType[PluginType["Indexer"] = 1] = "Indexer";
    PluginType[PluginType["Store"] = 2] = "Store";
    PluginType[PluginType["Repo"] = 4] = "Repo";
    PluginType[PluginType["Finder"] = 8] = "Finder";
})(exports.PluginType || (exports.PluginType = {}));
var PluginType = exports.PluginType;
//# sourceMappingURL=PluginTypes.js.map
