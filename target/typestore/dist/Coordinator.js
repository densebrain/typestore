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
require('reflect-metadata');
require('./Globals');
Promise = require('bluebird');
var assert = require('assert');
var Log = require('./log');
var Constants_1 = require('./Constants');
var Types_1 = require('./Types');
var Messages_1 = require("./Messages");
var Util_1 = require("./Util");
var PluginTypes_1 = require("./PluginTypes");
// Create logger
var log = Log.create(__filename);

var Coordinator = function () {
    function Coordinator() {
        _classCallCheck(this, Coordinator);

        this.plugins = [];
        /**
         * Model registration map type
         */
        /**
         * Stores all registrations, enabling
         * them to be configured against a
         * changed client, multiple datasources,
         * utility scripts, etc
         *
         * @type {{}}
         */
        this.modelMap = {};
        this.models = [];
        /**
         * Default options
         */
        this.options = new Types_1.CoordinatorOptions(null);
        this.initialized = false;
        // NOTE: settled and settling Promise are overriden properties - check below namespace
        this.startPromise = null;
        this.internal = {
            started: false
        };
    }

    _createClass(Coordinator, [{
        key: 'notify',
        value: function notify(eventType) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            this.plugins.forEach(function (plugin) {
                return plugin.handle.apply(plugin, [eventType].concat(args));
            });
        }
        /**
         * Retrieve model registrations
         *
         * @returns {TModelTypeMap}
         */

    }, {
        key: 'getModels',
        value: function getModels() {
            return this.models;
        }
    }, {
        key: 'findModel',
        value: function findModel(predicate) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.models[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var modelType = _step.value;

                    if (predicate(modelType)) {
                        return modelType;
                    }
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

            log.info('unable to find registered model for clazz in', Object.keys(this.modelMap));
            return null;
        }
    }, {
        key: 'getModel',
        value: function getModel(clazz) {
            return this.findModel(function (model) {
                return model.clazz === clazz;
            });
        }
    }, {
        key: 'getModelByName',
        value: function getModelByName(name) {
            return this.findModel(function (model) {
                return model.name === name;
            });
        }
    }, {
        key: 'getOptions',
        value: function getOptions() {
            return this.options;
        }
    }, {
        key: 'checkInitialized',
        value: function checkInitialized() {
            var not = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            this.checkStarted(true);
            assert(not ? !this.initialized : this.initialized, Messages_1.msg(not ? Messages_1.Strings.ManagerInitialized : Messages_1.Strings.ManagerNotInitialized));
        }
    }, {
        key: 'checkStarted',
        value: function checkStarted() {
            var not = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var valid = not ? !this.started : this.started;
            assert(valid, Messages_1.msg(not ? Messages_1.Strings.ManagerSettled : Messages_1.Strings.ManagerNotSettled));
        }
    }, {
        key: 'stores',
        value: function stores() {
            return Util_1.PluginFilter(this.plugins, Types_1.PluginType.Store);
        }
        /**
         * Set the coordinator options
         */

    }, {
        key: 'init',
        value: function init(newOptions) {
            for (var _len2 = arguments.length, newPlugins = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                newPlugins[_key2 - 1] = arguments[_key2];
            }

            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                var _plugins,
                    _this = this;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                this.checkStarted(true);
                                this.checkInitialized(true);
                                this.initialized = true;
                                (_plugins = this.plugins).push.apply(_plugins, newPlugins);
                                // Update the default options
                                this.options = this.options || newOptions;
                                Object.assign(this.options, newOptions);
                                // Make sure we got a valid store
                                assert(this.stores().length > 0, Messages_1.msg(Messages_1.Strings.ManagerTypeStoreRequired));
                                // Coordinator is ready, now initialize the store
                                log.debug(Messages_1.msg(Messages_1.Strings.ManagerInitComplete));
                                _context2.next = 10;
                                return Util_1.PromiseMap(this.plugins, function (plugin) {
                                    return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                                        return regeneratorRuntime.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        if (!plugin) {
                                                            _context.next = 3;
                                                            break;
                                                        }

                                                        _context.next = 3;
                                                        return plugin.init(this, this.options);

                                                    case 3:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, this);
                                    }));
                                });

                            case 10:
                                return _context2.abrupt('return', this);

                            case 11:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
        /**
         * Start the coordinator and embedded store from options
         *
         * @returns {Bluebird<boolean>}
         */

    }, {
        key: 'start',
        value: function start() {
            for (var _len3 = arguments.length, models = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                models[_key3] = arguments[_key3];
            }

            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                this.checkStarted(true);
                                models.forEach(this.registerModel.bind(this));
                                _context3.prev = 2;

                                this.startPromise = Util_1.PromiseMap(this.plugins, function (plugin) {
                                    return plugin && plugin.start();
                                });
                                _context3.next = 6;
                                return this.startPromise;

                            case 6:
                                _context3.prev = 6;

                                this.started = true;
                                this.startPromise = null;
                                return _context3.finish(6);

                            case 10:
                                return _context3.abrupt('return', this);

                            case 11:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[2,, 6, 10]]);
            }));
        }
    }, {
        key: 'stop',
        value: function stop() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (this.started) {
                                    _context4.next = 2;
                                    break;
                                }

                                return _context4.abrupt('return', this);

                            case 2:
                                _context4.prev = 2;
                                _context4.next = 5;
                                return this.startPromise;

                            case 5:
                                if (!_context4.sent) {
                                    _context4.next = 9;
                                    break;
                                }

                                this.startPromise.then(this.stopPlugins.bind(this));
                                _context4.next = 10;
                                break;

                            case 9:
                                this.stopPlugins();

                            case 10:
                                _context4.next = 15;
                                break;

                            case 12:
                                _context4.prev = 12;
                                _context4.t0 = _context4['catch'](2);

                                log.error('Coordinator shutdown was not clean');

                            case 15:
                                _context4.prev = 15;

                                this.startPromise = null;
                                this.started = false;
                                this.initialized = false;
                                this.plugins = [];
                                this.models = [];
                                this.modelMap = {};
                                return _context4.finish(15);

                            case 23:
                                return _context4.abrupt('return', this);

                            case 24:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[2, 12, 15, 23]]);
            }));
        }
        /**
         * Execute function either immediately if
         * ready or when the starting Promise
         * completes
         *
         * @param fn
         */

    }, {
        key: 'execute',
        value: function execute(fn) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                var _this2 = this;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                return _context5.abrupt('return', new Promise(function (resolve, reject) {
                                    function executeFn() {
                                        var result = fn.apply(undefined, arguments);
                                        resolve(result);
                                    }
                                    function handleError(err) {
                                        var fnName = fn ? fn.name : null;
                                        log.error(Messages_1.msg(Messages_1.Strings.ManagerErrorFn, fnName ? fnName : 'UNKNOWN'), err);
                                        reject(err);
                                    }
                                    return _this2.startPromise ? _this2.startPromise.then(executeFn).catch(handleError) : Promise.resolve(executeFn).catch(handleError);
                                }));

                            case 1:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: 'stopPlugins',
        value: function stopPlugins() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return Util_1.PromiseMap(this.plugins, function (plugin) {
                                    return plugin && plugin.stop();
                                });

                            case 2:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        }
        /**
         * Reset the coordinator status
         *
         * @returns {Coordinator.reset}
         */

    }, {
        key: 'reset',
        value: function reset() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee7() {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.stop();

                            case 2:
                                return _context7.abrupt('return', this);

                            case 3:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));
        }
        /**
         * Register a model with the system
         *
         * @param clazzName
         * @param constructor
         * @param opts
         */

    }, {
        key: 'registerModel',
        value: function registerModel(constructor) {
            this.checkStarted(true);
            var model = this.getModel(constructor);
            if (model) {
                log.info('Trying to register ' + model.name + ' a second time? is autoregister enabled?');
                return;
            }
            var modelOpts = Reflect.getMetadata(Constants_1.TypeStoreModelKey, constructor);
            model = {
                options: modelOpts,
                name: modelOpts.clazzName,
                clazz: constructor
            };
            this.modelMap[modelOpts.clazzName] = model;
            this.models.push(model);
            this.notify(PluginTypes_1.PluginEventType.ModelRegister, model);
            return this;
        }
        /**
         * Get a repository for the specified model/class
         *
         * @param clazz
         * @returns {T}
         */

    }, {
        key: 'getRepo',
        value: function getRepo(clazz) {
            var repo = new clazz();
            repo.init(this);
            this.notify(PluginTypes_1.PluginEventType.RepoInit, repo);
            repo.start();
            return repo;
        }
    }, {
        key: 'started',
        get: function get() {
            return this.startPromise !== null && this.internal.started;
        },
        set: function set(newVal) {
            this.internal.started = newVal;
        }
    }]);

    return Coordinator;
}();

exports.Coordinator = Coordinator;
//# sourceMappingURL=Coordinator.js.map
