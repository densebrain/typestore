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
var typestore_1 = require('typestore');
var IndexedDBConstants_1 = require("./IndexedDBConstants");
/**
 * Super simple plain jain key for now
 * what you send to the constructor comes out the
 * other end
 *
 * just like poop!
 */

var IndexedDBKeyValue = function IndexedDBKeyValue() {
    _classCallCheck(this, IndexedDBKeyValue);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    this.args = args;
};

exports.IndexedDBKeyValue = IndexedDBKeyValue;

var IndexedDBRepoPlugin = function () {
    function IndexedDBRepoPlugin(store, repo) {
        _classCallCheck(this, IndexedDBRepoPlugin);

        this.store = store;
        this.repo = repo;
        this.type = typestore_1.PluginType.Repo | typestore_1.PluginType.Finder;
        this.supportedModels = [repo.modelClazz];
        this.keys = repo.modelType.options.attrs.filter(function (attr) {
            return attr.primaryKey || attr.secondaryKey;
        }).map(function (attr) {
            return attr.name;
        });
        repo.attach(this);
    }

    _createClass(IndexedDBRepoPlugin, [{
        key: "decorateFinder",
        value: function decorateFinder(repo, finderKey) {
            var _this = this;

            var finderOpts = typestore_1.getMetadata(IndexedDBConstants_1.IndexedDBFinderKey, this.repo, finderKey);
            if (!finderOpts) return null;
            return function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                    var results, mapper;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    _context.next = 2;
                                    return this.table.filter(function (record) {
                                        return finderOpts.filter.apply(finderOpts, [record].concat(args));
                                    }).toArray();

                                case 2:
                                    results = _context.sent;
                                    mapper = this.repo.getMapper(this.repo.modelClazz);
                                    return _context.abrupt("return", results.map(function (record) {
                                        return mapper.fromObject(record);
                                    }));

                                case 5:
                                case "end":
                                    return _context.stop();
                            }
                        }
                    }, _callee, this);
                }));
            };
        }
    }, {
        key: "handle",
        value: function handle(eventType) {
            return false;
        }
    }, {
        key: "init",
        value: function init(coordinator, opts) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt("return", this.coordinator = coordinator);

                            case 1:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: "start",
        value: function start() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                return _context3.abrupt("return", this.coordinator);

                            case 1:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: "stop",
        value: function stop() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                return _context4.abrupt("return", this.coordinator);

                            case 1:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
    }, {
        key: "key",
        value: function key() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return new (Function.prototype.bind.apply(IndexedDBKeyValue, [null].concat(args)))();
        }
    }, {
        key: "keyFromObject",
        value: function keyFromObject(o) {
            return new (Function.prototype.bind.apply(IndexedDBKeyValue, [null].concat(_toConsumableArray(this.keys.map(function (key) {
                return o[key];
            })))))();
        }
    }, {
        key: "get",
        value: function get(key) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                var _this2 = this;

                var dbObjects;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.table.filter(function (record) {
                                    var recordKey = _this2.keyFromObject(record);
                                    var matched = Array.arraysEqual(key.args, recordKey.args);
                                    return matched;
                                }).toArray();

                            case 2:
                                dbObjects = _context5.sent;

                                if (!(dbObjects.length === 0)) {
                                    _context5.next = 7;
                                    break;
                                }

                                return _context5.abrupt("return", null);

                            case 7:
                                if (!(dbObjects.length > 1)) {
                                    _context5.next = 9;
                                    break;
                                }

                                throw new Error("More than one database object returned for key: " + JSON.stringify(key.args));

                            case 9:
                                return _context5.abrupt("return", this.repo.getMapper(this.repo.modelClazz).fromObject(dbObjects[0]));

                            case 10:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: "save",
        value: function save(o) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
                var json;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                json = this.repo.getMapper(this.repo.modelClazz).toObject(o);
                                _context6.next = 3;
                                return this.table.add(json);

                            case 3:
                                return _context6.abrupt("return", o);

                            case 4:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        }
        // FIXME: Need to implement key support - tests are more important

    }, {
        key: "remove",
        value: function remove(key) {
            return Promise.resolve(this.table.delete(key.args[0]));
        }
    }, {
        key: "count",
        value: function count() {
            return Promise.resolve(this.table.count());
        }
    }, {
        key: "table",
        get: function get() {
            return this.store.table(this.repo.modelType);
        }
    }]);

    return IndexedDBRepoPlugin;
}();

exports.IndexedDBRepoPlugin = IndexedDBRepoPlugin;
//# sourceMappingURL=IndexedDBRepoPlugin.js.map
