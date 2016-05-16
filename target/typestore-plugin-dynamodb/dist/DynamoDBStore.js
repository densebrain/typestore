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
///<reference path="../typings/typestore-plugin-dynamodb"/>
require('reflect-metadata');
var typestore_1 = require('typestore');
var AWS = require('aws-sdk');
var _ = require('lodash');
var assert = require('assert');
var _typestore_1$Messages = typestore_1.Messages;
var msg = _typestore_1$Messages.msg;
var Strings = _typestore_1$Messages.Strings;

var DynamoDBTypes_1 = require("./DynamoDBTypes");
var DynamoDBRepoPlugin_1 = require("./DynamoDBRepoPlugin");
// Set the aws promise provide to bluebird
//(AWS.config as any).setPromiseDependency(Promise)
var log = typestore_1.Log.create(__filename);
var DynamoStrings = {
    TableDeleting: 'Table is DELETING ?0'
};
exports.DynamoDBFinderKey = 'dynamodb:finder';
var DefaultDynamoDBProvisioning = {
    writeCapacityUnits: 5,
    readCapacityUnits: 5
};
var DefaultDynamoDBOptions = {
    awsOptions: {
        region: 'us-east-1'
    }
};
function tableNameParam(TableName) {
    return { TableName: TableName };
}
function isTableStatusIn(status) {
    if (_.isString(status)) {
        status = DynamoDBTypes_1.TableStatus[status];
    }

    for (var _len = arguments.length, statuses = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        statuses[_key - 1] = arguments[_key];
    }

    return _.includes(statuses, status);
}
function typeToDynamoType(type) {
    var typeName = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    log.debug('type = ', type, typeName);
    return type === String || typeName === 'String' ? 'S' : type === Number || typeName === 'Number' ? 'N' : type === Array || typeName === 'Array' ? 'L' : 'M'; //object
}
/**
 * Internal dynamo key map class
 */

var DynamoDBModelKeyAttribute = function () {
    function DynamoDBModelKeyAttribute(name, attrType, type) {
        _classCallCheck(this, DynamoDBModelKeyAttribute);

        this.name = name;
        this.attrType = attrType;
        this.type = type;
    }

    _createClass(DynamoDBModelKeyAttribute, [{
        key: 'toKeySchema',
        value: function toKeySchema() {
            return {
                AttributeName: this.name,
                KeyType: this.type
            };
        }
    }, {
        key: 'toAttributeDef',
        value: function toAttributeDef() {
            return {
                AttributeName: this.name,
                AttributeType: typeToDynamoType(this.attrType)
            };
        }
    }]);

    return DynamoDBModelKeyAttribute;
}();

exports.DynamoDBModelKeyAttribute = DynamoDBModelKeyAttribute;

var DynamoDBModelKey = function DynamoDBModelKey(hashKey, rangeKey) {
    _classCallCheck(this, DynamoDBModelKey);

    this.hashKey = hashKey;
    this.rangeKey = rangeKey;
};

exports.DynamoDBModelKey = DynamoDBModelKey;

var DynamoDBKeyValue = function () {
    function DynamoDBKeyValue(keySchema, hashValue, rangeValue) {
        _classCallCheck(this, DynamoDBKeyValue);

        this.keySchema = keySchema;
        this.hashValue = hashValue;
        this.rangeValue = rangeValue;
    }

    _createClass(DynamoDBKeyValue, [{
        key: 'toParam',
        value: function toParam() {
            var _this = this;

            var params = {};
            this.keySchema.forEach(function (keyDef) {
                params[keyDef.AttributeName] = DynamoDBTypes_1.KeyType[keyDef.KeyType] === DynamoDBTypes_1.KeyType.HASH ? _this.hashValue : _this.rangeValue;
            });
            return params;
        }
    }]);

    return DynamoDBKeyValue;
}();

exports.DynamoDBKeyValue = DynamoDBKeyValue;
/**
 * Store implementation for DynamoDB
 */

var DynamoDBStore = function () {
    /**
     * Create new dynamodbstore
     */

    function DynamoDBStore() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, DynamoDBStore);

        this.opts = opts;
        this.type = typestore_1.PluginType.Store;
        this._availableTables = [];
        this.tableDescs = {};
        this.repos = {};

        for (var _len2 = arguments.length, supportedModels = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            supportedModels[_key2 - 1] = arguments[_key2];
        }

        this.supportedModels = supportedModels;
        _.defaultsDeep(this.opts, DefaultDynamoDBOptions);
    }
    /**
     * Set default provisioning capacity
     *
     * @param provisioning
     */


    _createClass(DynamoDBStore, [{
        key: 'handle',
        value: function handle(eventType) {
            switch (eventType) {
                case typestore_1.PluginEventType.RepoInit:
                    var repo = arguments.length <= 1 ? undefined : arguments[1];
                    if (this.supportedModels.length === 0 || this.supportedModels.includes(repo.modelClazz)) {
                        return this.initRepo(repo);
                    }
            }
            return false;
        }
        /**
         * Get all currently available tables
         *
         * @returns {string[]}
         */

    }, {
        key: 'init',

        /**
         * Called during the coordinators initialization process
         *
         * @param coordinator
         * @param opts
         * @returns {Promise<ICoordinator>}
         */
        value: function init(coordinator, opts) {
            this.coordinator = coordinator;
            this.coordinatorOpts = opts;
            return Promise.resolve(coordinator);
        }
        /**
         * Create a new dynamo type store
         *
         * @returns {Promise<boolean>}
         */

    }, {
        key: 'start',
        value: function start() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this.opts.awsOptions) AWS.config.update(this.opts.awsOptions);
                                _context.next = 3;
                                return this.syncModels();

                            case 3:
                                return _context.abrupt('return', _context.sent);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
        /**
         * Stop/kill/shutdown the store
         *
         * @returns {Bluebird<boolean>}
         */

    }, {
        key: 'stop',
        value: function stop() {
            this._docClient = null;
            this._dynamoClient = null;
            return Promise.resolve(this.coordinator);
        }
    }, {
        key: 'initRepo',
        value: function initRepo(repo) {
            var clazzName = repo.modelOpts.clazzName;

            if (this.repos[clazzName]) {
                return this.repos[clazzName].repo;
            }
            this.repos[clazzName] = new DynamoDBRepoPlugin_1.DynamoDBRepoPlugin(this, repo);
            return repo;
        }
        /**
         * Determine the attribute type to
         * be used with dynamo from the js def
         *
         * NOTE: If you manually set the awsAttrType
         * that value will be used
         *
         * @param attr
         * @returns {string}
         */

    }, {
        key: 'attributeType',
        value: function attributeType(attr) {
            if (attr.awsAttrType) {
                return attr.awsAttrType;
            }
            var type = attr.type;
            log.info('Checking attribute type for ' + attr.name, type);
            attr.awsAttrType = typeToDynamoType(type, attr.typeName);
            log.debug('Resolved type ' + attr.awsAttrType);
            return attr.awsAttrType;
        }
        /**
         * Create dynamo table definition
         *
         * @param clazzName
         * @returns {AWS.DynamoDB.CreateTableInput}
         */

    }, {
        key: 'tableDefinition',
        value: function tableDefinition(clazzName) {
            var _this2 = this;

            log.debug('Creating table definition for ' + clazzName);
            var model = this.coordinator.getModelByName(clazzName);
            var modelOptions = model.options;
            if (!modelOptions) {
                log.info('No model options found, returning null');
                return null;
            }
            var prefix = this.opts.prefix || '',
                TableName = '' + prefix + modelOptions.tableName;
            // Create the table definition
            var provisioning = modelOptions.provisioning || {};
            _.defaults(provisioning, DefaultDynamoDBProvisioning);
            // Assemble attribute definitions
            var keySchema = [];
            var attrDefs = [];
            // Secondary instances
            var globalIndexes = [];
            var allAttrs = {};
            modelOptions.attrs.forEach(function (attr) {
                // Determine attribute type
                attr.awsAttrType = _this2.attributeType(attr);
                // Create the attr
                var awsAttr = {
                    AttributeName: attr.name,
                    AttributeType: attr.awsAttrType
                };
                // Keep a ref for indexes
                allAttrs[attr.name] = awsAttr;
                if (attr.primaryKey || attr.secondaryKey) {
                    log.debug('Adding key ' + attr.name, awsAttr);
                    // make sure its one or the other
                    if (attr.primaryKey && attr.secondaryKey) assert(msg(Strings.ManagerOnlyOneKeyType, attr.name));
                    keySchema.push({
                        AttributeName: attr.name,
                        KeyType: DynamoDBTypes_1.KeyType[attr.primaryKey ? DynamoDBTypes_1.KeyType.HASH : DynamoDBTypes_1.KeyType.RANGE]
                    });
                    attrDefs.push(awsAttr);
                }
            });
            /**
             * Loop again to build ancilaries - this could
             * be baked in above, but separating leaves more
             * options in the future
             */
            modelOptions.attrs.forEach(function (attr) {
                if (!attr.index) return;
                var indexDef = attr.index;
                if (indexDef.isSecondaryKey) {} else {
                    var _keySchema = [];
                    _keySchema.push({
                        AttributeName: attr.name,
                        KeyType: DynamoDBTypes_1.KeyType[DynamoDBTypes_1.KeyType.HASH]
                    });
                    attrDefs.push(allAttrs[attr.name]);
                    if (indexDef.secondaryKey) {
                        _keySchema.push({
                            AttributeName: indexDef.secondaryKey,
                            KeyType: DynamoDBTypes_1.KeyType[DynamoDBTypes_1.KeyType.RANGE]
                        });
                    }
                    globalIndexes.push({
                        IndexName: indexDef.name,
                        KeySchema: _keySchema,
                        Projection: {
                            ProjectionType: 'ALL'
                        },
                        ProvisionedThroughput: {
                            ReadCapacityUnits: provisioning.readCapacityUnits,
                            WriteCapacityUnits: provisioning.writeCapacityUnits
                        }
                    });
                }
            });
            modelOptions.tableDef = {
                TableName: TableName,
                KeySchema: keySchema,
                AttributeDefinitions: attrDefs,
                GlobalSecondaryIndexes: globalIndexes,
                ProvisionedThroughput: {
                    ReadCapacityUnits: provisioning.readCapacityUnits,
                    WriteCapacityUnits: provisioning.writeCapacityUnits
                }
            };
            if (!globalIndexes.length) {
                delete modelOptions.tableDef['GlobalSecondaryIndexes'];
            }
            log.debug('Table def', JSON.stringify(modelOptions.tableDef, null, 4));
            return modelOptions.tableDef;
        }
        /**
         * Record the fact that the table is now available
         *
         * @param TableName
         * @returns {boolean}
         */

    }, {
        key: 'setTableAvailable',
        value: function setTableAvailable(TableName) {
            log.info('Setting table available ' + TableName);
            this.availableTables.push(TableName);
            return true;
        }
        /**
         * Wait for the table to become available
         *
         * @returns {Promise<boolean>}
         */

    }, {
        key: 'waitForTable',
        value: function waitForTable(TableName) {
            var resourceState = arguments.length <= 1 || arguments[1] === undefined ? DynamoDBTypes_1.ResourceState.tableExists : arguments[1];

            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.dynamoClient.waitFor(DynamoDBTypes_1.ResourceState[resourceState], tableNameParam(TableName)).promise();

                            case 2:
                                return _context2.abrupt('return', this.setTableAvailable(TableName));

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
        /**
         * Find an existing table
         *
         * @param TableName
         * @return {any}
         */

    }, {
        key: 'describeTable',
        value: function describeTable(TableName) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                var newTableDesc;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.prev = 0;
                                _context3.next = 3;
                                return this.dynamoClient.describeTable({ TableName: TableName }).promise();

                            case 3:
                                newTableDesc = _context3.sent;

                                this.tableDescs[TableName] = newTableDesc.Table;
                                return _context3.abrupt('return', newTableDesc.Table);

                            case 8:
                                _context3.prev = 8;
                                _context3.t0 = _context3['catch'](0);

                                if (!(_context3.t0.code === 'ResourceNotFoundException')) {
                                    _context3.next = 13;
                                    break;
                                }

                                log.info('Table does not exist ' + TableName);
                                return _context3.abrupt('return', null);

                            case 13:
                                throw _context3.t0;

                            case 14:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[0, 8]]);
            }));
        }
    }, {
        key: 'createTable',
        value: function createTable(tableDef) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                var TableName, createResult, status;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                TableName = tableDef.TableName;

                                log.info('In create ' + TableName, tableDef);
                                _context4.next = 4;
                                return this.dynamoClient.createTable(tableDef).promise();

                            case 4:
                                createResult = _context4.sent;
                                status = createResult.TableDescription.TableStatus;
                                // ERROR STATE - table deleting

                                if (!isTableStatusIn(status, DynamoDBTypes_1.TableStatus.DELETING)) {
                                    _context4.next = 8;
                                    break;
                                }

                                throw new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName));

                            case 8:
                                if (!isTableStatusIn.apply(undefined, [status].concat(_toConsumableArray(DynamoDBTypes_1.StatusPending)))) {
                                    _context4.next = 12;
                                    break;
                                }

                                log.debug('Waiting for table to create ' + TableName);
                                _context4.next = 12;
                                return this.waitForTable(TableName, DynamoDBTypes_1.ResourceState.tableExists);

                            case 12:
                                this.setTableAvailable(tableDef.TableName);
                                return _context4.abrupt('return', true);

                            case 14:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
    }, {
        key: 'updateTable',
        value: function updateTable(tableDef) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                var TableName, updateDef, tableDesc, updateResult, status;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                TableName = tableDef.TableName;
                                updateDef = _.clone(tableDef);

                                delete updateDef.KeySchema;
                                tableDesc = this.tableDescs[TableName];

                                if (!_.isMatch(tableDesc, updateDef)) {
                                    _context5.next = 7;
                                    break;
                                }

                                log.debug('No change to table definition ' + TableName);
                                return _context5.abrupt('return', Promise.resolve(this.setTableAvailable(TableName)));

                            case 7:
                                _context5.next = 9;
                                return this.dynamoClient.updateTable(updateDef).promise();

                            case 9:
                                updateResult = _context5.sent;
                                status = updateResult.TableDescription.TableStatus;
                                // ERROR STATE - table deleting

                                if (!isTableStatusIn(status, DynamoDBTypes_1.TableStatus.DELETING)) {
                                    _context5.next = 13;
                                    break;
                                }

                                throw new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName));

                            case 13:
                                if (!isTableStatusIn.apply(undefined, [status].concat(_toConsumableArray(DynamoDBTypes_1.StatusPending)))) {
                                    _context5.next = 17;
                                    break;
                                }

                                log.debug('Waiting for table to update ' + TableName);
                                _context5.next = 17;
                                return this.waitForTable(TableName, DynamoDBTypes_1.ResourceState.tableExists);

                            case 17:
                                return _context5.abrupt('return', updateResult);

                            case 18:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: 'deleteTable',
        value: function deleteTable(tableDef) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
                var TableName;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                TableName = tableDef.TableName;
                                _context6.next = 3;
                                return this.dynamoClient.deleteTable({ TableName: TableName }).promise();

                            case 3:
                                _context6.next = 5;
                                return this.waitForTable(TableName, DynamoDBTypes_1.ResourceState.tableNotExists);

                            case 5:
                                return _context6.abrupt('return', true);

                            case 6:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        }
        /**
         * Synchronize table with dynamo store
         *
         * @param tableDef
         * @returns {any}
         */

    }, {
        key: 'syncTable',
        value: function syncTable(tableDef) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee7() {
                var TableName, tableInfo;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                TableName = tableDef.TableName;

                                log.info('Creating table ' + TableName);
                                // If the table exists and in OVERWRITE MODE
                                _context7.next = 4;
                                return this.describeTable(TableName);

                            case 4:
                                tableInfo = _context7.sent;

                                if (!(tableInfo && this.coordinatorOpts.syncStrategy === typestore_1.Types.SyncStrategy.Overwrite)) {
                                    _context7.next = 11;
                                    break;
                                }

                                _context7.next = 8;
                                return this.deleteTable(tableDef);

                            case 8:
                                _context7.next = 10;
                                return this.createTable(tableDef);

                            case 10:
                                return _context7.abrupt('return', _context7.sent);

                            case 11:
                                if (tableInfo) {
                                    _context7.next = 15;
                                    break;
                                }

                                _context7.next = 14;
                                return this.createTable(tableDef);

                            case 14:
                                return _context7.abrupt('return', _context7.sent);

                            case 15:
                                if (!isTableStatusIn.apply(undefined, [DynamoDBTypes_1.TableStatus[tableInfo.TableStatus]].concat(_toConsumableArray(DynamoDBTypes_1.StatusPending)))) {
                                    _context7.next = 20;
                                    break;
                                }

                                _context7.next = 18;
                                return this.waitForTable(TableName);

                            case 18:
                                _context7.next = 21;
                                break;

                            case 20:
                                this.setTableAvailable(TableName);

                            case 21:
                                _context7.next = 23;
                                return this.updateTable(tableDef);

                            case 23:
                                return _context7.abrupt('return', true);

                            case 24:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));
        }
    }, {
        key: 'syncModels',
        value: function syncModels() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee9() {
                var _this3 = this;

                var models, tableDefs;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.prev = 0;

                                log.info('Creating table definitions');
                                // Get all table definitions no matter what
                                models = this.coordinator.getModels();
                                tableDefs = models.map(function (modelType) {
                                    return _this3.tableDefinition(modelType.name);
                                });
                                // If create is not enabled then skip

                                if (!(this.coordinatorOpts.syncStrategy !== typestore_1.SyncStrategy.None)) {
                                    _context9.next = 7;
                                    break;
                                }

                                _context9.next = 7;
                                return typestore_1.PromiseMap(tableDefs, function (tableDef) {
                                    return __awaiter(_this3, void 0, void 0, regeneratorRuntime.mark(function _callee8() {
                                        return regeneratorRuntime.wrap(function _callee8$(_context8) {
                                            while (1) {
                                                switch (_context8.prev = _context8.next) {
                                                    case 0:
                                                        _context8.next = 2;
                                                        return this.syncTable(tableDef);

                                                    case 2:
                                                    case 'end':
                                                        return _context8.stop();
                                                }
                                            }
                                        }, _callee8, this);
                                    }));
                                });

                            case 7:
                                return _context9.abrupt('return', this.coordinator);

                            case 10:
                                _context9.prev = 10;
                                _context9.t0 = _context9['catch'](0);

                                log.error('table sync failed', _context9.t0.stack, _context9.t0);
                                throw _context9.t0;

                            case 14:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this, [[0, 10]]);
            }));
        }
        /**
         * Query a table, likely from a finder
         *
         * @param params
         * @returns {Promise<DynamoDB.QueryOutput>}
         */

    }, {
        key: 'query',
        value: function query(params) {
            return Promise.resolve(this.documentClient.query(params).promise());
        }
        /**
         * Full table scan
         *
         * @param params
         * @returns {Promise<DynamoDB.ScanOutput>}
         */

    }, {
        key: 'scan',
        value: function scan(params) {
            return Promise.resolve(this.documentClient.scan(params).promise());
        }
        /**
         * Get an item
         *
         * @param params
         * @returns {Promise<DynamoDB.GetItemOutput>}
         */

    }, {
        key: 'get',
        value: function get(params) {
            return Promise.resolve(this.documentClient.get(params).promise());
        }
        /**
         * Create/Update item
         *
         * @param params
         * @returns {Promise<DynamoDB.PutItemOutput>}
         */

    }, {
        key: 'put',
        value: function put(params) {
            return Promise.resolve(this.documentClient.put(params).promise());
        }
    }, {
        key: 'delete',
        value: function _delete(params) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee10() {
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return this.documentClient.delete(params).promise();

                            case 2:
                                return _context10.abrupt('return', _context10.sent);

                            case 3:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));
        }
    }, {
        key: 'availableTables',
        get: function get() {
            return this._availableTables;
        }
        /**
         * Get the AWS service options being used
         *
         * @returns {any}
         */

    }, {
        key: 'serviceOptions',
        get: function get() {
            var opts = {};
            if (this.opts.dynamoEndpoint) {
                opts.endpoint = this.opts.dynamoEndpoint;
            }
            return opts;
        }
        /**
         * Retrieve the actual dynamo client
         *
         * @returns {AWS.DynamoDB}
         */

    }, {
        key: 'dynamoClient',
        get: function get() {
            if (!this._dynamoClient) {
                this._dynamoClient = new AWS.DynamoDB(this.serviceOptions);
            }
            return this._dynamoClient;
        }
    }, {
        key: 'documentClient',
        get: function get() {
            if (!this._docClient) {
                this._docClient = new AWS.DynamoDB.DocumentClient(this.serviceOptions);
            }
            return this._docClient;
        }
    }], [{
        key: 'setDefaultProvisioning',
        value: function setDefaultProvisioning(provisioning) {
            Object.assign(DefaultDynamoDBProvisioning, provisioning);
        }
    }]);

    return DynamoDBStore;
}();

exports.DynamoDBStore = DynamoDBStore;
//# sourceMappingURL=DynamoDBStore.js.map
