"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
var dexie_1 = require('dexie');
var typestore_1 = require('typestore');
var IndexedDBRepoPlugin_1 = require("./IndexedDBRepoPlugin");
var log = typestore_1.Log.create(__filename);
/**
 * Default options
 */
exports.LocalStorageOptionDefaults = {
    databaseName: 'typestore-db'
};
/**
 * Uses dexie under the covers - its a mature library - and i'm lazy
 */

var IndexedDBPlugin = function () {
    function IndexedDBPlugin() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, IndexedDBPlugin);

        this.opts = opts;
        this.type = typestore_1.PluginType.Store;
        this.repoPlugins = {};
        this.opts = Object.assign({}, exports.LocalStorageOptionDefaults, opts);

        for (var _len = arguments.length, supportedModels = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            supportedModels[_key - 1] = arguments[_key];
        }

        this.supportedModels = supportedModels;
    }

    _createClass(IndexedDBPlugin, [{
        key: 'open',
        value: function open() {
            this.internalDb = new dexie_1.default(this.opts.databaseName, this.opts.provider);
            return this.internalDb;
        }
    }, {
        key: 'handle',
        value: function handle(eventType) {
            switch (eventType) {
                case typestore_1.PluginEventType.RepoInit:
                    return typestore_1.repoAttachIfSupported(arguments.length <= 1 ? undefined : arguments[1], this);
            }
            return false;
        }
    }, {
        key: 'table',
        value: function table(modelType) {
            var table = this.tables[modelType.name];
            if (!table) throw new Error('Unable to find a table definition for ' + modelType.name);
            return table;
        }
    }, {
        key: 'init',
        value: function init(coordinator, opts) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.coordinator = coordinator;
                                return _context.abrupt('return', coordinator);

                            case 2:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }, {
        key: 'start',
        value: function start() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                var _this = this;

                var models, schema;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                models = this.coordinator.getModels();
                                // Table needs to be created
                                // TODO: Should only use indexed attributes for schema

                                schema = models.reduce(function (schema, modelType) {
                                    schema[modelType.name] = modelType.options.attrs.map(function (attr) {
                                        return attr.name;
                                    }).join(',');
                                    log.info('Created schema for ' + modelType.name, schema[modelType.name]);
                                    return schema;
                                }, {});

                                log.info('Creating schema', schema);
                                this.open().version(1).stores(schema);
                                _context2.next = 6;
                                return this.internalDb.open();

                            case 6:
                                this.tables = models.reduce(function (tables, modelType) {
                                    tables[modelType.name] = _this.internalDb.table(modelType.name);
                                    return tables;
                                }, {});
                                return _context2.abrupt('return', this.coordinator);

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: 'stop',
        value: function stop() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!this.internalDb) {
                                    _context3.next = 3;
                                    break;
                                }

                                _context3.next = 3;
                                return this.internalDb.close();

                            case 3:
                                return _context3.abrupt('return', this.coordinator);

                            case 4:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: 'syncModels',
        value: function syncModels() {
            log.debug('Currently the localstorage plugin does not sync models');
            return Promise.resolve(this.coordinator);
        }
        /**
         * Initialize a new repo
         * TODO: verify this logic works - just reading it makes me think we could be
         *  asked to init a repo a second time with the same type and do nothing
         *
         * @param repo
         * @returns {T}
         */

    }, {
        key: 'initRepo',
        value: function initRepo(repo) {
            var plugin = this.repoPlugins[repo.modelType.name];
            if (plugin) return plugin.repo;
            plugin = new IndexedDBRepoPlugin_1.IndexedDBRepoPlugin(this, repo);
            return plugin.repo;
        }
    }, {
        key: 'db',
        get: function get() {
            return this.internalDb;
        }
    }]);

    return IndexedDBPlugin;
}();

exports.IndexedDBPlugin = IndexedDBPlugin;
//# sourceMappingURL=IndexedDBPlugin.js.map
