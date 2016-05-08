"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var typestore_1 = require('typestore');
var AWS = require('aws-sdk');
var _ = require('lodash');
var assert = require('assert');
var _typestore_1$Messages = typestore_1.Messages;
var msg = _typestore_1$Messages.msg;
var Strings = _typestore_1$Messages.Strings;

var DynamoDBRepo_1 = require("./DynamoDBRepo");
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
(function (KeyType) {
    KeyType[KeyType["HASH"] = 0] = "HASH";
    KeyType[KeyType["RANGE"] = 1] = "RANGE";
})(exports.KeyType || (exports.KeyType = {}));
var KeyType = exports.KeyType;
(function (ResourceState) {
    ResourceState[ResourceState["tableExists"] = 0] = "tableExists";
    ResourceState[ResourceState["tableNotExists"] = 1] = "tableNotExists";
})(exports.ResourceState || (exports.ResourceState = {}));
var ResourceState = exports.ResourceState;
(function (TableStatus) {
    TableStatus[TableStatus["CREATING"] = 0] = "CREATING";
    TableStatus[TableStatus["UPDATING"] = 1] = "UPDATING";
    TableStatus[TableStatus["DELETING"] = 2] = "DELETING";
    TableStatus[TableStatus["ACTIVE"] = 3] = "ACTIVE";
})(exports.TableStatus || (exports.TableStatus = {}));
var TableStatus = exports.TableStatus;
var StatusPending = [TableStatus.CREATING, TableStatus.UPDATING];
function isTableStatusIn(status) {
    if (_.isString(status)) {
        status = TableStatus[status];
    }

    for (var _len = arguments.length, statuses = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        statuses[_key - 1] = arguments[_key];
    }

    return _.includes(statuses, status);
}
function typeToDynamoType(type) {
    return type === String ? 'S' : type === Number ? 'N' : type === Array ? 'L' : 'M'; //object
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
                params[keyDef.AttributeName] = KeyType[keyDef.KeyType] === KeyType.HASH ? _this.hashValue : _this.rangeValue;
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
        _classCallCheck(this, DynamoDBStore);

        this._availableTables = [];
        this.tableDescs = {};
        this.repos = {};
    }
    /**
     * Set default provisioning capacity
     *
     * @param provisioning
     */


    _createClass(DynamoDBStore, [{
        key: 'init',
        value: function init(manager, opts) {
            this.manager = manager;
            this.opts = opts;
            _.defaultsDeep(this.opts, DefaultDynamoDBOptions);
            return typestore_1.Promise.resolve(true);
        }
        /**
         * Create a new dynamo type store
         *
         * @returns {Promise<boolean>}
         */

    }, {
        key: 'start',
        value: function start() {
            if (this.opts.awsOptions) AWS.config.update(this.opts.awsOptions);
            return this.syncModels();
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
            return typestore_1.Promise.resolve(true);
        }
        /**
         * Create a repo for the supplied
         *
         * @param clazz
         * @returns {null}
         */

    }, {
        key: 'getRepo',
        value: function getRepo(repoClazz) {
            //const repoClazzType = Reflect.getMetadata('design:type',repoClazz.prototype)
            var repoClazzName = repoClazz.name;
            // Check to see if we have created this repo before
            var repo = this.repos[repoClazzName];
            // If not - create it
            if (!repo) {
                repo = this.repos[repoClazzName] = new DynamoDBRepo_1.DynamoDBRepo(this, repoClazzName, repoClazz);
            }
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
            attr.awsAttrType = typeToDynamoType(type);
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
            var modelRegs = this.manager.getModelRegistrations();
            var modelReg = modelRegs[clazzName];
            var prefix = this.opts.prefix || '',
                TableName = '' + prefix + modelReg.tableName;
            // Create the table definition
            var provisioning = modelReg.provisioning || {};
            _.defaults(provisioning, DefaultDynamoDBProvisioning);
            // Assemble attribute definitions
            var keySchema = [];
            var attrDefs = [];
            // Secondary instances
            var globalIndexes = [];
            var allAttrs = {};
            modelReg.attrs.forEach(function (attr) {
                // Determine attribute type
                attr.awsAttrType = _this2.attributeType(attr);
                // Create the attr
                var awsAttr = {
                    AttributeName: attr.name,
                    AttributeType: attr.awsAttrType
                };
                // Keep a ref for indexes
                allAttrs[attr.name] = awsAttr;
                if (attr.hashKey || attr.rangeKey) {
                    log.debug('Adding key ' + attr.name);
                    // make sure its one or the other
                    if (attr.hashKey && attr.rangeKey) assert(msg(Strings.ManagerOnlyOneKeyType, attr.name));
                    keySchema.push({
                        AttributeName: attr.name,
                        KeyType: KeyType[attr.hashKey ? KeyType.HASH : KeyType.RANGE]
                    });
                    attrDefs.push(awsAttr);
                }
            });
            /**
             * Loop again to build ancilaries - this could
             * be baked in above, but separating leaves more
             * options in the future
             */
            modelReg.attrs.forEach(function (attr) {
                if (!attr.index) return;
                var indexDef = attr.index;
                if (indexDef.isAlternateRangeKey) {} else {
                    var _keySchema = [];
                    _keySchema.push({
                        AttributeName: attr.name,
                        KeyType: KeyType[KeyType.HASH]
                    });
                    attrDefs.push(allAttrs[attr.name]);
                    if (indexDef.rangeKey) {
                        _keySchema.push({
                            AttributeName: indexDef.rangeKey,
                            KeyType: KeyType[KeyType.RANGE]
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
            modelReg.tableDef = {
                TableName: TableName,
                KeySchema: keySchema,
                AttributeDefinitions: attrDefs,
                GlobalSecondaryIndexes: globalIndexes,
                ProvisionedThroughput: {
                    ReadCapacityUnits: provisioning.readCapacityUnits,
                    WriteCapacityUnits: provisioning.writeCapacityUnits
                }
            };
            return modelReg.tableDef;
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
            var resourceState = arguments.length <= 1 || arguments[1] === undefined ? ResourceState.tableExists : arguments[1];

            return typestore_1.Promise.resolve(this.dynamoClient.waitFor(ResourceState[resourceState], tableNameParam(TableName)).promise()).then(this.setTableAvailable.bind(this, TableName));
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
            var _this3 = this;

            return typestore_1.Promise.resolve(this.dynamoClient.describeTable({ TableName: TableName }).promise().then(function (newTableDesc) {
                _this3.tableDescs[TableName] = newTableDesc.Table;
                return newTableDesc.Table;
            })).catch(function (err) {
                if (err.code === 'ResourceNotFoundException') {
                    log.info('Table does not exist ' + TableName);
                    return typestore_1.Promise.resolve(null);
                }
                return typestore_1.Promise.reject(err);
            });
        }
    }, {
        key: 'createTable',
        value: function createTable(tableDef) {
            var _this4 = this;

            var TableName = tableDef.TableName;
            log.info('In create ' + TableName);
            return typestore_1.Promise.resolve(this.dynamoClient.createTable(tableDef).promise().then(function (createResult) {
                var status = createResult.TableDescription.TableStatus;
                // ERROR STATE - table deleting
                if (isTableStatusIn(status, TableStatus.DELETING)) return typestore_1.Promise.reject(new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName)));
                var promised = typestore_1.Promise.resolve(createResult);
                if (isTableStatusIn.apply(undefined, [status].concat(StatusPending))) {
                    log.debug('Waiting for table to create ' + TableName);
                    promised.then(function () {
                        return _this4.waitForTable(TableName, ResourceState.tableExists);
                    });
                }
                return promised.return(true);
            }));
        }
    }, {
        key: 'updateTable',
        value: function updateTable(tableDef) {
            var _this5 = this;

            var TableName = tableDef.TableName;
            var updateDef = _.clone(tableDef);
            delete updateDef.KeySchema;
            var tableDesc = this.tableDescs[TableName];
            if (_.isMatch(tableDesc, updateDef)) {
                log.debug('No change to table definition ' + TableName);
                return typestore_1.Promise.resolve(this.setTableAvailable(TableName));
            }
            return typestore_1.Promise.resolve(this.dynamoClient.updateTable(updateDef).promise().then(function (updateResult) {
                var status = updateResult.TableDescription.TableStatus;
                // ERROR STATE - table deleting
                if (isTableStatusIn(status, TableStatus.DELETING)) return typestore_1.Promise.reject(new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName)));
                var promised = typestore_1.Promise.resolve(updateResult);
                if (isTableStatusIn.apply(undefined, [status].concat(StatusPending))) {
                    log.debug('Waiting for table to update ' + TableName);
                    promised.then(_this5.waitForTable.bind(_this5, TableName, ResourceState.tableExists)).return(updateResult);
                }
                return promised;
            }));
        }
    }, {
        key: 'deleteTable',
        value: function deleteTable(tableDef) {
            var TableName = tableDef.TableName;
            return typestore_1.Promise.resolve(this.dynamoClient.deleteTable({ TableName: TableName }).promise()).then(this.waitForTable.bind(this, TableName, ResourceState.tableNotExists));
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
            var _this6 = this;

            var TableName = tableDef.TableName;
            log.info('Creating table ' + TableName);
            return this.describeTable(TableName).then(function (tableInfo) {
                // If the table exists and in OVERWRITE MODE
                if (tableInfo && _this6.opts.syncStrategy === typestore_1.Types.SyncStrategy.Overwrite) {
                    return _this6.deleteTable(tableDef).return(tableDef).then(_this6.createTable.bind(_this6));
                }
                // If the table does not exist
                if (!tableInfo) {
                    return _this6.createTable(tableDef);
                }
                if (isTableStatusIn.apply(undefined, [TableStatus[tableInfo.TableStatus]].concat(StatusPending))) return _this6.waitForTable(TableName).return(tableDef).then(_this6.updateTable.bind(_this6));else return _this6.updateTable(tableDef);
            });
        }
    }, {
        key: 'syncModels',
        value: function syncModels() {
            log.info('Creating table definitions');
            // Get all table definitions no matter what
            var tableDefs = [];
            var modelRegistrations = this.manager.getModelRegistrations();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(modelRegistrations)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var clazzName = _step.value;

                    tableDefs.push(this.tableDefinition(clazzName));
                }
                // If create is not enabled then skip
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

            if (this.opts.syncStrategy === typestore_1.Types.SyncStrategy.None) {
                log.debug(msg(Strings.ManagerNoSyncModels));
                return typestore_1.Promise.resolve(true);
            }
            return typestore_1.Promise.each(tableDefs, this.syncTable.bind(this)).return(true);
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
            return typestore_1.Promise.resolve(this.documentClient.query(params).promise());
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
            return typestore_1.Promise.resolve(this.documentClient.scan(params).promise());
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
            return typestore_1.Promise.resolve(this.documentClient.get(params).promise());
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
            return typestore_1.Promise.resolve(this.documentClient.put(params).promise());
        }
    }, {
        key: 'delete',
        value: function _delete(params) {
            return typestore_1.Promise.resolve(this.documentClient.delete(params).promise());
        }
    }, {
        key: 'availableTables',

        /**
         * Get all currently available tables
         *
         * @returns {string[]}
         */
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
