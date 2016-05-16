"use strict";

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var Types_1 = require("./Types");
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
    return plugin.type && (plugin.type & type) > 0;
}
exports.isPluginOfType = isPluginOfType;
function isRepoPlugin(plugin) {
    return isPluginOfType(plugin, Types_1.PluginType.Repo);
}
exports.isRepoPlugin = isRepoPlugin;
function isStorePlugin(plugin) {
    return isPluginOfType(plugin, Types_1.PluginType.Store);
}
exports.isStorePlugin = isStorePlugin;
function isIndexerPlugin(plugin) {
    return isPluginOfType(plugin, Types_1.PluginType.Indexer);
}
exports.isIndexerPlugin = isIndexerPlugin;
function isFinderPlugin(plugin) {
    return isPluginOfType(plugin, Types_1.PluginType.Finder);
}
exports.isFinderPlugin = isFinderPlugin;
function PromiseMap(values, mapper) {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        var results;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        results = values.map(function (value) {
                            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                _context.next = 2;
                                                return Promise.resolve(mapper(value));

                                            case 2:
                                                return _context.abrupt("return", _context.sent);

                                            case 3:
                                            case "end":
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, this);
                            }));
                        });
                        _context2.next = 3;
                        return Promise.all(results);

                    case 3:
                        return _context2.abrupt("return", _context2.sent);

                    case 4:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}
exports.PromiseMap = PromiseMap;
function PluginFilter(plugins, type) {
    return plugins.filter(type == Types_1.PluginType.Repo ? isRepoPlugin : type == Types_1.PluginType.Store ? isStorePlugin : type == Types_1.PluginType.Indexer ? isIndexerPlugin : isFinderPlugin);
}
exports.PluginFilter = PluginFilter;
function isInstanceType(val, type) {
    return val instanceof type;
}
exports.isInstanceType = isInstanceType;
function includesUnlessEmpty(arr, val) {
    return arr.length === 0 || arr.includes(val);
}
exports.includesUnlessEmpty = includesUnlessEmpty;
function repoAttachIfSupported(repo, plugin) {
    return includesUnlessEmpty(plugin.supportedModels, repo.modelClazz) ? plugin.initRepo(repo) : null;
}
exports.repoAttachIfSupported = repoAttachIfSupported;
//# sourceMappingURL=Util.js.map
