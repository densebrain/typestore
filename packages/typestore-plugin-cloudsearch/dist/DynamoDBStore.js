"use strict";
var typestore_1 = require('typestore');
var AWS = require('aws-sdk');
var _ = require('lodash');
var assert = require('assert');
var msg = typestore_1.Messages.msg, Strings = typestore_1.Messages.Strings;
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
    function DynamoDBModelKey(hashKey, rangeKey) {
        this.hashKey = hashKey;
        this.rangeKey = rangeKey;
    }
    return DynamoDBModelKey;
}());
exports.DynamoDBModelKey = DynamoDBModelKey;
var DynamoDBKeyValue = (function () {
    function DynamoDBKeyValue(keySchema, hashValue, rangeValue) {
        this.keySchema = keySchema;
        this.hashValue = hashValue;
        this.rangeValue = rangeValue;
    }
    DynamoDBKeyValue.prototype.toParam = function () {
        var _this = this;
        var params = {};
        this.keySchema.forEach(function (keyDef) {
            params[keyDef.AttributeName] =
                (KeyType[keyDef.KeyType] === KeyType.HASH) ?
                    _this.hashValue :
                    _this.rangeValue;
        });
        return params;
    };
    return DynamoDBKeyValue;
}());
exports.DynamoDBKeyValue = DynamoDBKeyValue;
/**
 * Store implementation for DynamoDB
 */
var DynamoDBStore = (function () {
    /**
     * Create new dynamodbstore
     */
    function DynamoDBStore() {
        this._availableTables = [];
        this.tableDescs = {};
        this.repos = {};
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
        return typestore_1.Promise.resolve(true);
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
        return typestore_1.Promise.resolve(true);
    };
    /**
     * Create a repo for the supplied
     *
     * @param clazz
     * @returns {null}
     */
    DynamoDBStore.prototype.getRepo = function (repoClazz) {
        //const repoClazzType = Reflect.getMetadata('design:type',repoClazz.prototype)
        var repoClazzName = repoClazz.name;
        // Check to see if we have created this repo before
        var repo = this.repos[repoClazzName];
        // If not - create it
        if (!repo) {
            repo = this.repos[repoClazzName] =
                new DynamoDBRepo_1.DynamoDBRepo(this, repoClazzName, repoClazz);
        }
        return repo;
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
    /**
     * Create dynamo table definition
     *
     * @param clazzName
     * @returns {AWS.DynamoDB.CreateTableInput}
     */
    DynamoDBStore.prototype.tableDefinition = function (clazzName) {
        var _this = this;
        log.debug("Creating table definition for " + clazzName);
        var models = this.manager.getModels();
        var model = this.manager.getModelByName(clazzName);
        var modelOptions = model.options;
        var prefix = this.opts.prefix || '', TableName = "" + prefix + modelOptions.tableName;
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
            attr.awsAttrType = _this.attributeType(attr);
            // Create the attr
            var awsAttr = {
                AttributeName: attr.name,
                AttributeType: attr.awsAttrType
            };
            // Keep a ref for indexes
            allAttrs[attr.name] = awsAttr;
            if (attr.hashKey || attr.rangeKey) {
                log.debug("Adding key " + attr.name);
                // make sure its one or the other
                if (attr.hashKey && attr.rangeKey)
                    assert(msg(Strings.ManagerOnlyOneKeyType, attr.name));
                keySchema.push({
                    AttributeName: attr.name,
                    KeyType: KeyType[(attr.hashKey) ? KeyType.HASH : KeyType.RANGE]
                });
                attrDefs.push(awsAttr);
            }
        });
        /**
         * Loop again to build ancilaries - this could
         * be baked in above, but separating leaves more
         * options in the future
         */
        modelOptions.attrs
            .forEach(function (attr) {
            if (!attr.index)
                return;
            var indexDef = attr.index;
            if (indexDef.isAlternateRangeKey) {
            }
            else {
                var keySchema_1 = [];
                keySchema_1.push({
                    AttributeName: attr.name,
                    KeyType: KeyType[KeyType.HASH]
                });
                attrDefs.push(allAttrs[attr.name]);
                if (indexDef.rangeKey) {
                    keySchema_1.push({
                        AttributeName: indexDef.rangeKey,
                        KeyType: KeyType[KeyType.RANGE]
                    });
                }
                globalIndexes.push({
                    IndexName: indexDef.name,
                    KeySchema: keySchema_1,
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
        return modelOptions.tableDef;
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
        return typestore_1.Promise.resolve(this.dynamoClient.waitFor(ResourceState[resourceState], tableNameParam(TableName))
            .promise()).then(this.setTableAvailable.bind(this, TableName));
    };
    /**
     * Find an existing table
     *
     * @param TableName
     * @return {any}
     */
    DynamoDBStore.prototype.describeTable = function (TableName) {
        var _this = this;
        return typestore_1.Promise.resolve(this.dynamoClient.describeTable({ TableName: TableName })
            .promise()
            .then(function (newTableDesc) {
            _this.tableDescs[TableName] = newTableDesc.Table;
            return newTableDesc.Table;
        })).catch(function (err) {
            if (err.code === 'ResourceNotFoundException') {
                log.info("Table does not exist " + TableName);
                return typestore_1.Promise.resolve(null);
            }
            return typestore_1.Promise.reject(err);
        });
    };
    DynamoDBStore.prototype.createTable = function (tableDef) {
        var _this = this;
        var TableName = tableDef.TableName;
        log.info("In create " + TableName);
        return typestore_1.Promise.resolve(this.dynamoClient.createTable(tableDef).promise()
            .then(function (createResult) {
            var status = createResult.TableDescription.TableStatus;
            // ERROR STATE - table deleting
            if (isTableStatusIn(status, TableStatus.DELETING))
                return typestore_1.Promise.reject(new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName)));
            var promised = typestore_1.Promise.resolve(createResult);
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
        var tableDesc = this.tableDescs[TableName];
        if (_.isMatch(tableDesc, updateDef)) {
            log.debug("No change to table definition " + TableName);
            return typestore_1.Promise.resolve(this.setTableAvailable(TableName));
        }
        return typestore_1.Promise.resolve(this.dynamoClient.updateTable(updateDef)
            .promise()
            .then(function (updateResult) {
            var status = updateResult.TableDescription.TableStatus;
            // ERROR STATE - table deleting
            if (isTableStatusIn(status, TableStatus.DELETING))
                return typestore_1.Promise.reject(new Error(msg(DynamoStrings.TableDeleting, tableDef.TableName)));
            var promised = typestore_1.Promise.resolve(updateResult);
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
        return typestore_1.Promise.resolve(this.dynamoClient.deleteTable({ TableName: TableName })
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
        return this.describeTable(TableName)
            .then(function (tableInfo) {
            // If the table exists and in OVERWRITE MODE
            if (tableInfo && _this.opts.syncStrategy === typestore_1.Types.SyncStrategy.Overwrite) {
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
        var models = this.manager.getModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var modelType = models_1[_i];
            tableDefs.push(this.tableDefinition(modelType.name));
        }
        // If create is not enabled then skip
        if (this.opts.syncStrategy === typestore_1.Types.SyncStrategy.None) {
            log.debug(msg(Strings.ManagerNoSyncModels));
            return typestore_1.Promise.resolve(true);
        }
        return typestore_1.Promise.each(tableDefs, this.syncTable.bind(this)).return(true);
    };
    /**
     * Query a table, likely from a finder
     *
     * @param params
     * @returns {Promise<DynamoDB.QueryOutput>}
     */
    DynamoDBStore.prototype.query = function (params) {
        return typestore_1.Promise.resolve(this.documentClient.query(params).promise());
    };
    /**
     * Full table scan
     *
     * @param params
     * @returns {Promise<DynamoDB.ScanOutput>}
     */
    DynamoDBStore.prototype.scan = function (params) {
        return typestore_1.Promise.resolve(this.documentClient.scan(params).promise());
    };
    /**
     * Get an item
     *
     * @param params
     * @returns {Promise<DynamoDB.GetItemOutput>}
     */
    DynamoDBStore.prototype.get = function (params) {
        return typestore_1.Promise.resolve(this.documentClient.get(params).promise());
    };
    /**
     * Create/Update item
     *
     * @param params
     * @returns {Promise<DynamoDB.PutItemOutput>}
     */
    DynamoDBStore.prototype.put = function (params) {
        return typestore_1.Promise.resolve(this.documentClient.put(params).promise());
    };
    DynamoDBStore.prototype.delete = function (params) {
        return typestore_1.Promise.resolve(this.documentClient.delete(params).promise());
    };
    return DynamoDBStore;
}());
exports.DynamoDBStore = DynamoDBStore;

//# sourceMappingURL=DynamoDBStore.js.map
