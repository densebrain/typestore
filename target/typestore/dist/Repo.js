"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var Constants_1 = require("./Constants");
var Types_1 = require("./Types");
var Errors_1 = require("./Errors");
var Log = require('./log');
var Util_1 = require("./Util");
var ModelMapper_1 = require("./ModelMapper");
var MetadataManager_1 = require("./MetadataManager");
var log = Log.create(__filename);
/**
 * The core Repo implementation
 *
 * When requested from the coordinator,
 * it offers itself to all configured plugins for
 * them to attach to the model pipeline
 *
 *
 */

var Repo = function () {
    /**
     * Core repo is instantiated by providing the implementing/extending
     * class and the model that will be supported
     *
     * @param repoClazz
     * @param modelClazz
     */

    function Repo(repoClazz, modelClazz) {
        _classCallCheck(this, Repo);

        this.repoClazz = repoClazz;
        this.modelClazz = modelClazz;
        this.plugins = Array();
    }

    _createClass(Repo, [{
        key: "init",
        value: function init(coordinator) {
            this.coordinator = coordinator;
            this.modelType = coordinator.getModel(this.modelClazz);
            this.modelOpts = this.modelType.options;
            this.repoOpts = Reflect.getMetadata(Constants_1.TypeStoreRepoKey, this.repoClazz);
        }
    }, {
        key: "start",
        value: function start() {
            // Grab a mapper
            this.mapper = this.getMapper(this.modelClazz);
            // Decorate all the finders
            this.decorateFinders();
        }
    }, {
        key: "getMapper",
        value: function getMapper(clazz) {
            return new ModelMapper_1.ModelMapper(clazz);
        }
    }, {
        key: "getRepoPlugins",
        value: function getRepoPlugins() {
            return Util_1.PluginFilter(this.plugins, Types_1.PluginType.Repo);
            // return this.plugins
            // 	.filter((plugin) => isRepoPlugin(plugin)) as IRepoPlugin<M>[]
        }
    }, {
        key: "getFinderPlugins",
        value: function getFinderPlugins() {
            return Util_1.PluginFilter(this.plugins, Types_1.PluginType.Finder);
        }
        /**
         * Attach a plugin to the repo - could be a store,
         * indexer, etc, etc
         *
         * @param plugin
         * @returns {Repo}
         */

    }, {
        key: "attach",
        value: function attach(plugin) {
            if (this.plugins.includes(plugin)) {
                log.warn("Trying to register repo plugin a second time");
            } else {
                this.plugins.push(plugin);
            }
            return this;
        }
    }, {
        key: "getFinderOptions",
        value: function getFinderOptions(finderKey) {
            return MetadataManager_1.getMetadata(Constants_1.TypeStoreFinderKey, this, finderKey);
        }
    }, {
        key: "decorateFinders",
        value: function decorateFinders() {
            var _this = this;

            var finderKeys = Reflect.getMetadata(Constants_1.TypeStoreFindersKey, this);
            if (finderKeys) {
                finderKeys.forEach(function (finderKey) {
                    var finder = void 0;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _this.plugins.filter(Util_1.isFinderPlugin)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var plugin = _step.value;

                            if (!Util_1.isFunction(plugin.decorateFinder)) continue;
                            var finderPlugin = plugin;
                            if (finder = finderPlugin.decorateFinder(_this, finderKey)) break;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    if (!finder && _this.getFinderOptions(finderKey).optional !== true) Errors_1.NotImplemented("No plugin supports this finder " + finderKey);
                    _this.setFinder(finderKey, finder);
                });
            }
        }
        /**
         * Create a generic finder, in order
         * to do this search options must have been
         * annotated on the model
         *
         * @param finderKey
         * @param searchProvider
         * @param searchOpts
         * @returns {any}
         */

    }, {
        key: "makeGenericFinder",
        value: function makeGenericFinder(finderKey, searchProvider, searchOpts) {
            var _this2 = this;

            /**
             * Get the finder options
             * @type {any}
             */
            var opts = this.getFinderOptions(finderKey);
            return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return __awaiter(_this2, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                    var _this3 = this;

                    var results, keys;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    _context2.next = 2;
                                    return searchProvider.search(this.modelType, searchOpts, args);

                                case 2:
                                    results = _context2.sent;

                                    // Once the provider returns the resulting data,
                                    // pass it to the mapper to get keys
                                    keys = results.map(function (result) {
                                        return searchOpts.resultKeyMapper(_this3, searchOpts.resultType, result);
                                    });
                                    return _context2.abrupt("return", keys.map(function (key) {
                                        return __awaiter(_this3, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                                while (1) {
                                                    switch (_context.prev = _context.next) {
                                                        case 0:
                                                            _context.next = 2;
                                                            return this.get(key);

                                                        case 2:
                                                            return _context.abrupt("return", _context.sent);

                                                        case 3:
                                                        case "end":
                                                            return _context.stop();
                                                    }
                                                }
                                            }, _callee, this);
                                        }));
                                    }));

                                case 5:
                                case "end":
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, this);
                }));
            };
        }
        /**
         * Set a finder function on the repo
         *
         * @param finderKey
         * @param finderFn
         */

    }, {
        key: "setFinder",
        value: function setFinder(finderKey, finderFn) {
            this[finderKey] = finderFn;
        }
        /**
         * Call out to the indexers
         *
         * @param type
         * @param models
         * @returns {Bluebird<boolean>}
         */

    }, {
        key: "index",
        value: function index(type) {
            for (var _len2 = arguments.length, models = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                models[_key2 - 1] = arguments[_key2];
            }

            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                var _this4 = this;

                var indexPlugins, doIndex;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                indexPlugins = Util_1.PluginFilter(this.plugins, Types_1.PluginType.Indexer);

                                doIndex = function doIndex(indexConfig) {
                                    return indexPlugins.map(function (plugin) {
                                        return plugin.index.apply(plugin, [type, indexConfig, _this4.modelType, _this4].concat(models));
                                    });
                                };
                                // Create all pending index promises


                                if (!this.repoOpts.indexes) {
                                    _context3.next = 5;
                                    break;
                                }

                                _context3.next = 5;
                                return Promise.all(this.repoOpts.indexes.reduce(function (promises, indexConfig) {
                                    return promises.concat(doIndex(indexConfig));
                                }, []));

                            case 5:
                                return _context3.abrupt("return", Promise.resolve(true));

                            case 6:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: "indexPromise",
        value: function indexPromise(action) {
            var _this5 = this;

            return function (models) {
                return __awaiter(_this5, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                    var indexPromise;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    indexPromise = this.index.apply(this, [action].concat(_toConsumableArray(models.filter(function (model) {
                                        return !!model;
                                    }))));
                                    _context4.next = 3;
                                    return Promise.resolve(indexPromise);

                                case 3:
                                    return _context4.abrupt("return", models);

                                case 4:
                                case "end":
                                    return _context4.stop();
                            }
                        }
                    }, _callee4, this);
                }));
            };
        }
        /**
         * Not implemented
         *
         * @param args
         * @returns {null}
         */

    }, {
        key: "key",
        value: function key() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.getRepoPlugins()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var plugin = _step2.value;

                    var key = plugin.key.apply(plugin, arguments);
                    if (key) return key;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return Errors_1.NotImplemented('key');
        }
        /**
         * Get one or more models with keys
         *
         * @param key
         * @returns {null}
         */

    }, {
        key: "get",
        value: function get(key) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
                var _this6 = this;

                var results, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, result;

                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                results = this.getRepoPlugins().map(function (plugin) {
                                    return __awaiter(_this6, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                                        return regeneratorRuntime.wrap(function _callee5$(_context5) {
                                            while (1) {
                                                switch (_context5.prev = _context5.next) {
                                                    case 0:
                                                        _context5.next = 2;
                                                        return plugin.get(key);

                                                    case 2:
                                                        return _context5.abrupt("return", _context5.sent);

                                                    case 3:
                                                    case "end":
                                                        return _context5.stop();
                                                }
                                            }
                                        }, _callee5, this);
                                    }));
                                });
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context6.prev = 4;
                                _iterator3 = results[Symbol.iterator]();

                            case 6:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context6.next = 13;
                                    break;
                                }

                                result = _step3.value;

                                if (!result) {
                                    _context6.next = 10;
                                    break;
                                }

                                return _context6.abrupt("return", result);

                            case 10:
                                _iteratorNormalCompletion3 = true;
                                _context6.next = 6;
                                break;

                            case 13:
                                _context6.next = 19;
                                break;

                            case 15:
                                _context6.prev = 15;
                                _context6.t0 = _context6["catch"](4);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context6.t0;

                            case 19:
                                _context6.prev = 19;
                                _context6.prev = 20;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 22:
                                _context6.prev = 22;

                                if (!_didIteratorError3) {
                                    _context6.next = 25;
                                    break;
                                }

                                throw _iteratorError3;

                            case 25:
                                return _context6.finish(22);

                            case 26:
                                return _context6.finish(19);

                            case 27:
                                return _context6.abrupt("return", null);

                            case 28:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[4, 15, 19, 27], [20,, 22, 26]]);
            }));
        }
        /**
         * Save model
         *
         * @param o
         * @returns {null}
         */

    }, {
        key: "save",
        value: function save(o) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee7() {
                var results, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, result;

                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return Util_1.PromiseMap(this.getRepoPlugins(), function (plugin) {
                                    return plugin.save(o);
                                });

                            case 2:
                                results = _context7.sent;
                                _context7.next = 5;
                                return this.indexPromise(Types_1.IndexAction.Add)(results);

                            case 5:
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context7.prev = 8;
                                _iterator4 = results[Symbol.iterator]();

                            case 10:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context7.next = 17;
                                    break;
                                }

                                result = _step4.value;

                                if (!result) {
                                    _context7.next = 14;
                                    break;
                                }

                                return _context7.abrupt("return", result);

                            case 14:
                                _iteratorNormalCompletion4 = true;
                                _context7.next = 10;
                                break;

                            case 17:
                                _context7.next = 23;
                                break;

                            case 19:
                                _context7.prev = 19;
                                _context7.t0 = _context7["catch"](8);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context7.t0;

                            case 23:
                                _context7.prev = 23;
                                _context7.prev = 24;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 26:
                                _context7.prev = 26;

                                if (!_didIteratorError4) {
                                    _context7.next = 29;
                                    break;
                                }

                                throw _iteratorError4;

                            case 29:
                                return _context7.finish(26);

                            case 30:
                                return _context7.finish(23);

                            case 31:
                                return _context7.abrupt("return", null);

                            case 32:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[8, 19, 23, 31], [24,, 26, 30]]);
            }));
        }
        /**
         * Remove a model
         *
         * @param key
         * @returns {null}
         */

    }, {
        key: "remove",
        value: function remove(key) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee8() {
                var model;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.get(key);

                            case 2:
                                model = _context8.sent;

                                if (model) {
                                    _context8.next = 6;
                                    break;
                                }

                                log.warn("No model found to remove with key", key);
                                return _context8.abrupt("return", null);

                            case 6:
                                _context8.next = 8;
                                return Util_1.PromiseMap(this.getRepoPlugins(), function (plugin) {
                                    return plugin.remove(key);
                                });

                            case 8:
                                return _context8.abrupt("return", this.indexPromise(Types_1.IndexAction.Remove)([model]));

                            case 9:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));
        }
        /**
         * Count models
         *
         * @returns {null}
         */

    }, {
        key: "count",
        value: function count() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee10() {
                var _this7 = this;

                var results;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return Promise.all(this.getRepoPlugins().map(function (plugin) {
                                    return __awaiter(_this7, void 0, void 0, regeneratorRuntime.mark(function _callee9() {
                                        return regeneratorRuntime.wrap(function _callee9$(_context9) {
                                            while (1) {
                                                switch (_context9.prev = _context9.next) {
                                                    case 0:
                                                        _context9.next = 2;
                                                        return plugin.count();

                                                    case 2:
                                                        return _context9.abrupt("return", _context9.sent);

                                                    case 3:
                                                    case "end":
                                                        return _context9.stop();
                                                }
                                            }
                                        }, _callee9, this);
                                    }));
                                }));

                            case 2:
                                results = _context10.sent;
                                return _context10.abrupt("return", results.reduce(function (prev, current) {
                                    return prev + current;
                                }));

                            case 4:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));
        }
    }]);

    return Repo;
}();

exports.Repo = Repo;
//# sourceMappingURL=Repo.js.map
