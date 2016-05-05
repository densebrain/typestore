"use strict";
//import Promise from './Promise'
var Promise = require('bluebird');
var Log = require('./log');
var AWS = require('aws-sdk');
var _ = require('lodash');
var assert = require('assert');
var Types_1 = require("./Types");
var Messages_1 = require("./Messages");
// Set the aws promise provide to bluebird
//(AWS.config as any).setPromiseDependency(Promise)
var log = Log.create(__filename);
var DynamoStrings = {
    TableDeleting: 'Table is DELETING ?0'
};
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
    var statuses = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        statuses[_i - 1] = arguments[_i];
    }
    if (_.isString(status)) {
        status = TableStatus[status];
    }
    return _.includes(statuses, status);
}
function typeToDynamoType(type) {
    return (type === String) ? 'S' :
        (type === Number) ? 'N' :
            (type === Array) ? 'L' :
                'M'; //object
}
/**
 * Internal dynamo key map class
 */
var DynamoDBModelKeyAttribute = (function () {
    function DynamoDBModelKeyAttribute(name, attrType, type) {
        this.name = name;
        this.attrType = attrType;
        this.type = type;
    }
    DynamoDBModelKeyAttribute.prototype.toKeySchema = function () {
        return {
            AttributeName: this.name,
            KeyType: this.type
        };
    };
    DynamoDBModelKeyAttribute.prototype.toAttributeDef = function () {
        return {
            AttributeName: this.name,
            AttributeType: typeToDynamoType(this.attrType)
        };
    };
    return DynamoDBModelKeyAttribute;
}());
exports.DynamoDBModelKeyAttribute = DynamoDBModelKeyAttribute;
var DynamoDBModelKey = (function () {
    function DynamoDBModelKey(hashKey, sortKey) {
        this.hashKey = hashKey;
        this.sortKey = sortKey;
    }
    return DynamoDBModelKey;
}());
exports.DynamoDBModelKey = DynamoDBModelKey;
var DynamoDBModelRepo = (function () {
    function DynamoDBModelRepo(store, modelClazz) {
        this.store = store;
        this.modelClazz = modelClazz;
        this.modelOpts = store.manager.findModelOptionsByClazz(modelClazz);
    }
    DynamoDBModelRepo.prototype.key = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return null;
    };
    DynamoDBModelRepo.prototype.get = function (key) {
        return null;
    };
    DynamoDBModelRepo.prototype.create = function (o) {
        return null;
    };
    DynamoDBModelRepo.prototype.update = function (o) {
        return null;
    };
    DynamoDBModelRepo.prototype.remove = function (key) {
        return null;
    };
    return DynamoDBModelRepo;
}());
exports.DynamoDBModelRepo = DynamoDBModelRepo;
var DynamoDBStore = (function () {
    /**
     * Create new dynamodbstore
     */
    function DynamoDBStore() {
        this._availableTables = [];
        this.tableDescs = {};
    }
    /**
     * Set default provisioning capacity
     *
     * @param provisioning
     */
    DynamoDBStore.setDefaultProvisioning = function (provisioning) {
        Object.assign(DefaultDynamoDBProvisioning, provisioning);
    };
    Object.defineProperty(DynamoDBStore.prototype, "availableTables", {
        /**
         * Get all currently available tables
         *
         * @returns {string[]}
         */
        get: function () {
            return this._availableTables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDBStore.prototype, "serviceOptions", {
        /**
         * Get the AWS service options being used
         *
         * @returns {any}
         */
        get: function () {
            var opts = {};
            if (this.opts.dynamoEndpoint) {
                opts.endpoint = this.opts.dynamoEndpoint;
            }
            return opts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDBStore.prototype, "dynamoClient", {
        /**
         * Retrieve the actual dynamo client
         *
         * @returns {AWS.DynamoDB}
         */
        get: function () {
            if (!this._dynamoClient) {
                this._dynamoClient = new AWS.DynamoDB(this.serviceOptions);
            }
            return this._dynamoClient;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDBStore.prototype, "documentClient", {
        get: function () {
            if (!this._docClient) {
                this._docClient = new AWS.DynamoDB.DocumentClient(this.serviceOptions);
            }
            return this._docClient;
        },
        enumerable: true,
        configurable: true
    });
    DynamoDBStore.prototype.init = function (manager, opts) {
        this.manager = manager;
        this.opts = opts;
        _.defaultsDeep(this.opts, DefaultDynamoDBOptions);
        return Promise.resolve(true);
    };
    /**
     * Create a new dynamo type store
     *
     * @returns {Promise<boolean>}
     */
    DynamoDBStore.prototype.start = function () {
        if (this.opts.awsOptions)
            AWS.config.update(this.opts.awsOptions);
        return this.syncModels();
    };
    /**
     * Stop/kill/shutdown the store
     *
     * @returns {Bluebird<boolean>}
     */
    DynamoDBStore.prototype.stop = function () {
        this._docClient = null;
        this._dynamoClient = null;
        return Promise.resolve(true);
    };
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
    DynamoDBStore.prototype.attributeType = function (attr) {
        if (attr.awsAttrType) {
            return attr.awsAttrType;
        }
        var type = attr.type;
        log.info("Checking attribute type for " + attr.name, type);
        attr.awsAttrType = typeToDynamoType(type);
        log.debug("Resolved type " + attr.awsAttrType);
        return attr.awsAttrType;
    };
    DynamoDBStore.prototype.tableDefinition = function (clazzName) {
        var _this = this;
        log.debug("Creating table definition for " + clazzName);
        var modelRegs = this.manager.getModelRegistrations();
        var modelReg = modelRegs[clazzName];
        var prefix = this.opts.prefix || '', TableName = "" + prefix + modelReg.tableName;
        // Assemble attribute definitions
        var keySchema = [];
        var attrDefs = [];
        modelReg.attrs.forEach(function (attr) {
            // Determine attribute type
            attr.awsAttrType = _this.attributeType(attr);
            if (attr.partitionKey || attr.sortKey) {
                log.debug("Adding key " + attr.name);
                // make sure its one or the other
                if (attr.partitionKey && attr.sortKey)
                    assert(Messages_1.msg(Messages_1.Strings.ManagerOnlyOneKeyType, attr.name));
                keySchema.push({
                    AttributeName: attr.name,
                    KeyType: KeyType[(attr.partitionKey) ? KeyType.HASH : KeyType.RANGE]
                });
                attrDefs.push({
                    AttributeName: attr.name,
                    AttributeType: attr.awsAttrType
                });
            }
        });
        // Create the table definition
        var provisioning = modelReg.provisioning || {};
        _.defaults(provisioning, DefaultDynamoDBProvisioning);
        modelReg.tableDef = {
            TableName: TableName,
            KeySchema: keySchema,
            AttributeDefinitions: attrDefs,
            ProvisionedThroughput: {
                ReadCapacityUnits: provisioning.readCapacityUnits,
                WriteCapacityUnits: provisioning.writeCapacityUnits
            }
        };
        return modelReg.tableDef;
    };
    /**
     * Create a repo for the supplied
     *
     * @param clazz
     * @returns {null}
     */
    DynamoDBStore.prototype.getModelRepo = function (clazz) {
        return null;
    };
    /**
     * Record the fact that the table is now available
     *
     * @param TableName
     * @returns {boolean}
     */
    DynamoDBStore.prototype.setTableAvailable = function (TableName) {
        log.info("Setting table available " + TableName);
        this.availableTables.push(TableName);
        return true;
    };
    /**
     * Wait for the table to become available
     *
     * @returns {Promise<boolean>}
     */
    DynamoDBStore.prototype.waitForTable = function (TableName, resourceState) {
        if (resourceState === void 0) { resourceState = ResourceState.tableExists; }
        return Promise.resolve(this.dynamoClient.waitFor(ResourceState[resourceState], tableNameParam(TableName))
            .promise()).then(this.setTableAvailable.bind(this, TableName));
    };
    /**
     * Find an existing table
     *
     * @param TableName
     * @return {any}
     */
    DynamoDBStore.prototype.findExistingTable = function (TableName) {
        var _this = this;
        return Promise.resolve(this.dynamoClient.describeTable({ TableName: TableName })
            .promise()
            .then(function (newTableDesc) {
            _this.tableDescs[TableName] = newTableDesc.Table;
            return newTableDesc.Table;
        })).catch(function (err) {
            if (err.code === 'ResourceNotFoundException') {
                log.info("Table does not exist " + TableName);
                return Promise.resolve(null);
            }
            return Promise.reject(err);
        });
    };
    DynamoDBStore.prototype.createTable = function (tableDef) {
        var _this = this;
        var TableName = tableDef.TableName;
        log.info("In create " + TableName);
        return Promise.resolve(this.dynamoClient.createTable(tableDef).promise()
            .then(function (createResult) {
            var status = createResult.TableDescription.TableStatus;
            // ERROR STATE - table deleting
            if (isTableStatusIn(status, TableStatus.DELETING))
                return Promise.reject(new Error(Messages_1.msg(DynamoStrings.TableDeleting, tableDef.TableName)));
            var promised = Promise.resolve(createResult);
            if (isTableStatusIn.apply(void 0, [status].concat(StatusPending))) {
                log.debug("Waiting for table to create " + TableName);
                promised.then(function () {
                    return _this.waitForTable(TableName, ResourceState.tableExists);
                });
            }
            return promised.return(true);
        }));
    };
    DynamoDBStore.prototype.updateTable = function (tableDef) {
        var _this = this;
        var TableName = tableDef.TableName;
        var updateDef = _.clone(tableDef);
        delete updateDef.KeySchema;
        //debugger
        var tableDesc = this.tableDescs[TableName];
        if (_.isMatch(tableDesc, updateDef)) {
            log.debug("No change to table definition " + TableName);
            return Promise.resolve(this.setTableAvailable(TableName));
        }
        return Promise.resolve(this.dynamoClient.updateTable(updateDef)
            .promise()
            .then(function (updateResult) {
            var status = updateResult.TableDescription.TableStatus;
            // ERROR STATE - table deleting
            if (isTableStatusIn(status, TableStatus.DELETING))
                return Promise.reject(new Error(Messages_1.msg(DynamoStrings.TableDeleting, tableDef.TableName)));
            var promised = Promise.resolve(updateResult);
            if (isTableStatusIn.apply(void 0, [status].concat(StatusPending))) {
                log.debug("Waiting for table to update " + TableName);
                promised
                    .then(_this.waitForTable.bind(_this, TableName, ResourceState.tableExists))
                    .return(updateResult);
            }
            return promised;
        }));
    };
    DynamoDBStore.prototype.deleteTable = function (tableDef) {
        var TableName = tableDef.TableName;
        return Promise.resolve(this.dynamoClient.deleteTable({ TableName: TableName })
            .promise()).then(this.waitForTable.bind(this, TableName, ResourceState.tableNotExists));
    };
    /**
     * Synchronize table with dynamo store
     *
     * @param tableDef
     * @returns {any}
     */
    DynamoDBStore.prototype.syncTable = function (tableDef) {
        var _this = this;
        var TableName = tableDef.TableName;
        log.info("Creating table " + TableName);
        return this.findExistingTable(TableName)
            .then(function (tableInfo) {
            // If the table exists and in OVERWRITE MODE
            if (tableInfo && _this.opts.syncStrategy === Types_1.SyncStrategy.Overwrite) {
                return _this.deleteTable(tableDef)
                    .return(tableDef)
                    .then(_this.createTable.bind(_this));
            }
            // If the table does not exist
            if (!tableInfo) {
                return _this.createTable(tableDef);
            }
            if (isTableStatusIn.apply(void 0, [TableStatus[tableInfo.TableStatus]].concat(StatusPending)))
                return _this.waitForTable(TableName)
                    .return(tableDef)
                    .then(_this.updateTable.bind(_this));
            else
                return _this.updateTable(tableDef);
        });
    };
    DynamoDBStore.prototype.syncModels = function () {
        log.info('Creating table definitions');
        // Get all table definitions no matter what
        var tableDefs = [];
        var modelRegistrations = this.manager.getModelRegistrations();
        for (var _i = 0, _a = Object.keys(modelRegistrations); _i < _a.length; _i++) {
            var clazzName = _a[_i];
            tableDefs.push(this.tableDefinition(clazzName));
        }
        // If create is not enabled then skip
        if (this.opts.syncStrategy === Types_1.SyncStrategy.None) {
            log.debug(Messages_1.msg(Messages_1.Strings.ManagerNoSyncModels));
            return Promise.resolve(true);
        }
        return Promise.each(tableDefs, this.syncTable.bind(this)).return(true);
    };
    return DynamoDBStore;
}());
exports.DynamoDBStore = DynamoDBStore;

//# sourceMappingURL=DynamoDBStore.js.map
