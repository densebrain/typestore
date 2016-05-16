///<reference path="../typings/typestore-plugin-dynamodb"/>
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
var assert = require('assert');
var _ = require('lodash');
var typestore_1 = require('typestore');
var DynamoDBTypes_1 = require("./DynamoDBTypes");
var DynamoDBConstants_1 = require("./DynamoDBConstants");
var DynamoDBKeyValue_1 = require("./DynamoDBKeyValue");
var log = typestore_1.Log.create(__filename);
var MappedFinderParams = {
    Projection: 'ProjectionExpression',
    QueryExpression: 'KeyConditionExpression',
    ScanExpression: 'FilterExpression',
    Aliases: 'ExpressionAttributeNames',
    Index: 'IndexName'
};

var DynamoDBRepoPlugin = function () {
    function DynamoDBRepoPlugin(store, repo) {
        _classCallCheck(this, DynamoDBRepoPlugin);

        this.store = store;
        this.repo = repo;
        this.type = typestore_1.PluginType.Repo | typestore_1.PluginType.Finder;
        assert(repo, 'Repo is required and must have a valid prototype');
        repo.attach(this);
        this.coordinator = this.store.coordinator;
        // Grab the table definition
        this.tableDef = this.store.tableDefinition(repo.modelOpts.clazzName);
        this.supportedModels = [repo.modelClazz];
    }

    _createClass(DynamoDBRepoPlugin, [{
        key: 'handle',
        value: function handle(eventType) {
            return false;
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
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt('return', this.coordinator);

                            case 1:
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
                                return _context3.abrupt('return', this.coordinator);

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
        /**
         * Table name for this repo
         *
         * @returns {TableName}
         */

    }, {
        key: 'makeParams',

        /**
         * DynamoDB API parameter helper
         *
         * @param params
         * @returns {({TableName: TableName}&{})|any}
         */
        value: function makeParams() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return Object.assign({
                TableName: this.tableName
            }, params);
        }
        /**
         * Creates a value mapper, which maps
         * arguments for a finder to values
         * that can be used by dynamo
         *
         * @param valuesOpt
         * @returns (any[]):{[key:string]:any}
         */

    }, {
        key: 'makeValueMapper',
        value: function makeValueMapper(valuesOpt) {
            return function (args) {
                if (valuesOpt) {
                    return _.isFunction(valuesOpt) ?
                    // If its a function then execute it
                    valuesOpt.apply(undefined, _toConsumableArray(args)) :
                    // If its an array map it by index
                    Array.isArray(valuesOpt) ? function () {
                        var values = {};
                        var argNameList = valuesOpt;
                        argNameList.forEach(function (valueOpt, index) {
                            values[':' + valueOpt] = args[index];
                        });
                    } :
                    // if its an object - good luck
                    valuesOpt;
                }
                return {};
            };
        }
        /**
         * Create the actual finder function
         * that is used by the repo
         *
         * @param repo
         * @param finderKey
         * @param finderOpts
         * @param defaultParams
         * @param valueMapper
         * @returns {function(...[any]): Promise<any>}
         */

    }, {
        key: 'makeFinderFn',
        value: function makeFinderFn(repo, finderKey, finderOpts, defaultParams, valueMapper) {
            var _this = this;

            var type = finderOpts.type || DynamoDBTypes_1.DynamoDBFinderType.Query;
            log.info('Making finder fn ' + finderKey);
            return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                    var params, results;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    log.debug('Executing finder ' + finderKey);
                                    params = _.assign(_.clone(defaultParams), {
                                        ExpressionAttributeValues: valueMapper(args)
                                    });
                                    // Find or scan

                                    _context4.next = 4;
                                    return type === DynamoDBTypes_1.DynamoDBFinderType.Query ? this.store.query(params) : this.store.scan(params);

                                case 4:
                                    results = _context4.sent;
                                    return _context4.abrupt('return', results.Items.map(function (item) {
                                        return repo.mapper.fromObject(item);
                                    }));

                                case 6:
                                case 'end':
                                    return _context4.stop();
                            }
                        }
                    }, _callee4, this);
                }));
            };
        }
        /**
         * Called by a repo to decorate a finder function
         *
         * @param repo
         * @param finderKey
         * @returns {any}
         */

    }, {
        key: 'decorateFinder',
        value: function decorateFinder(repo, finderKey) {
            var finderOpts = typestore_1.getMetadata(DynamoDBConstants_1.DynamoDBFinderKey, this.repo, finderKey);
            if (!finderOpts) {
                log.debug(finderKey + ' is not a dynamo finder, no dynamo finder options');
                return null;
            }
            log.debug('Making finder ' + finderKey + ':', finderOpts);
            var defaultParams = this.makeParams();
            var valuesOpt = finderOpts.values;
            var valueMapper = this.makeValueMapper(valuesOpt);
            Object.keys(finderOpts).forEach(function (key) {
                var val = finderOpts[key];
                var awsKey = key.charAt(0).toUpperCase() + key.substring(1);
                var mappedKey = MappedFinderParams[awsKey];
                if (mappedKey) {
                    defaultParams[mappedKey] = val;
                }
            });
            // Create the finder function
            return this.makeFinderFn(repo, finderKey, finderOpts, defaultParams, valueMapper);
        }
    }, {
        key: 'key',
        value: function key() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            assert(args && args.length > 0 && args.length < 3, 'Either 1 or two parameters can be used to create dynamo keys');
            return new DynamoDBKeyValue_1.DynamoDBKeyValue(this.tableDef.KeySchema, args[0], args[1]);
        }
    }, {
        key: 'get',
        value: function get(key) {
            var _this2 = this;

            return this.store.get(this.makeParams({
                Key: key.toParam()
            })).then(function (result) {
                return _this2.repo.mapper.fromObject(result.Item);
            });
        }
    }, {
        key: 'save',
        value: function save(o) {
            return this.store.put(this.makeParams({ Item: o })).then(function (result) {
                return o;
            });
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.store.delete(this.makeParams({
                                    Key: key.toParam()
                                }));

                            case 2:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: 'count',
        value: function count() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
                var tableDesc;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.store.describeTable(this.tableName);

                            case 2:
                                tableDesc = _context6.sent;
                                return _context6.abrupt('return', tableDesc.ItemCount);

                            case 4:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        }
    }, {
        key: 'tableName',
        get: function get() {
            return this.tableDef.TableName;
        }
    }]);

    return DynamoDBRepoPlugin;
}();

exports.DynamoDBRepoPlugin = DynamoDBRepoPlugin;
//# sourceMappingURL=DynamoDBRepoPlugin.js.map
