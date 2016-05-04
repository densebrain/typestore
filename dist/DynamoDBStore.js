"use strict";
var Log = require('./log');
var AWS = require('aws-sdk');
var _ = require('lodash');
var assert = require('assert');
var Promise_1 = require('./Promise');
var Messages_1 = require("./Messages");
//const DynamoDB = AWS.DynamoDB
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
var KeyTypes;
(function (KeyTypes) {
    KeyTypes[KeyTypes["HASH"] = 0] = "HASH";
    KeyTypes[KeyTypes["RANGE"] = 1] = "RANGE";
})(KeyTypes || (KeyTypes = {}));
var ResourceState;
(function (ResourceState) {
    ResourceState[ResourceState["tableExists"] = 0] = "tableExists";
    ResourceState[ResourceState["tableNotExists"] = 1] = "tableNotExists";
})(ResourceState || (ResourceState = {}));
var TableStatus;
(function (TableStatus) {
    TableStatus[TableStatus["CREATING"] = 0] = "CREATING";
    TableStatus[TableStatus["UPDATING"] = 1] = "UPDATING";
    TableStatus[TableStatus["DELETING"] = 2] = "DELETING";
    TableStatus[TableStatus["ACTIVE"] = 3] = "ACTIVE";
})(TableStatus || (TableStatus = {}));
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
var DynamoDBStore = (function () {
    /**
     *
     * @param baseOpts
     */
    function DynamoDBStore() {
        this._availableTables = [];
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
        get: function () {
            return this._availableTables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDBStore.prototype, "serviceOptions", {
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
        return Promise_1.default.resolve(true);
    };
    /**
     * Create a new dynamo type store
     *
     * @param manager
     * @param opts
     * @returns {Bluebird<boolean>}
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
        return Promise_1.default.resolve(true);
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
        attr.awsAttrType =
            (type === String) ? 'S' :
                (type === Number) ? 'N' :
                    (type === Array) ? 'L' :
                        'M'; //object
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
                    KeyType: KeyTypes[(attr.partitionKey) ? KeyTypes.HASH : KeyTypes.RANGE]
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
    DynamoDBStore.prototype.syncTable = function (tableDef) {
        var _this = this;
        var TableName = tableDef.TableName;
        var tableDesc = null;
        var setTableAvailable = function () {
            log.info("Setting table available " + TableName);
            _this.availableTables.push(TableName);
            return true;
        };
        /**
         * Wait for the table to become available
         *
         * @returns {Promise<boolean>}
         */
        var waitForTable = function () {
            return _this.dynamoClient.waitFor(ResourceState[ResourceState.tableExists], tableNameParam(TableName)).promise().then(setTableAvailable);
        };
        /**
         * Find an existing table
         */
        var findExistingTable = function () {
            return _this.dynamoClient.describeTable({ TableName: TableName })
                .promise()
                .then(function (newTableDesc) {
                return tableDesc = newTableDesc;
            })
                .catch(function (err) {
                if (err.code === 'ResourceNotFoundException') {
                    log.info("Table does not exist " + TableName);
                    return Promise_1.default.resolve(null);
                }
                return Promise_1.default.reject(err);
            });
        };
        /**
         * Create a new table
         *
         * @returns {Promise<any>}
         */
        var createTable = function () {
            return _this.dynamoClient.createTable(tableDef).promise()
                .then(function (createResult) {
                // TODO: AFTER LUNCH - HERE
                // * check result scheme in dash
                // * implement waitFor table complete
                // * progress/time updates in future
                // * TableStatus in the result data is what
                // * i want - CREATING/UPDATING
                var status = createResult.TableDescription.TableStatus;
                // ERROR STATE - table deleting
                if (isTableStatusIn(status, TableStatus.DELETING))
                    return Promise_1.default.reject(new Error(Messages_1.msg(DynamoStrings.TableDeleting, tableDef.TableName)));
                var promised = Promise_1.default.resolve(createResult);
                if (isTableStatusIn.apply(void 0, [status].concat(StatusPending))) {
                    log.debug("Waiting for table to create " + TableName);
                    promised.then(waitForTable).return(createResult);
                }
                return promised;
            });
        };
        var updateTable = function () {
            var updateDef = _.clone(tableDef);
            delete updateDef.KeySchema;
            //debugger
            if (_.isMatch(tableDesc.Table, updateDef)) {
                log.debug("No change to table definition " + TableName);
                return Promise_1.default.resolve(setTableAvailable());
            }
            return _this.dynamoClient.updateTable(updateDef)
                .promise()
                .then(function (updateResult) {
                var status = updateResult.TableDescription.TableStatus;
                // ERROR STATE - table deleting
                if (isTableStatusIn(status, TableStatus.DELETING))
                    return Promise_1.default.reject(new Error(Messages_1.msg(DynamoStrings.TableDeleting, tableDef.TableName)));
                var promised = Promise_1.default.resolve(updateResult);
                if (isTableStatusIn.apply(void 0, [status].concat(StatusPending))) {
                    log.debug("Waiting for table to update " + TableName);
                    promised.then(waitForTable).return(updateResult);
                }
                return promised;
            });
        };
        log.info("Creating table " + TableName);
        return findExistingTable()
            .then(function (tableInfo) {
            if (!tableInfo) {
                return createTable();
            }
            if (isTableStatusIn.apply(void 0, [TableStatus[tableInfo.TableStatus]].concat(StatusPending)))
                return waitForTable().then(updateTable);
            else
                return updateTable();
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
        if (this.opts.syncModels !== true) {
            log.debug(Messages_1.msg(Messages_1.Strings.ManagerNoCreateTables));
            return Promise_1.default.resolve(true);
        }
        return Promise_1.default.each(tableDefs, this.syncTable.bind(this)).return(true);
    };
    return DynamoDBStore;
}());
exports.DynamoDBStore = DynamoDBStore;

//# sourceMappingURL=DynamoDBStore.js.map
