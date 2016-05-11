///<reference path="../typings/typestore-plugin-dynamodb"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-dynamodb"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-sdk"/>
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var typestore_1 = require('typestore');
var assert = require('assert');
var _ = require('lodash');
var DynamoDBStore_1 = require("./DynamoDBStore");
var DynamoDBTypes_1 = require("./DynamoDBTypes");
var IncorrectKeyTypeError = typestore_1.Errors.IncorrectKeyTypeError;
var TypeStoreFindersKey = typestore_1.Constants.TypeStoreFindersKey;
var log = typestore_1.Log.create(__filename);
var MappedFinderParams = {
    Projection: 'ProjectionExpression',
    QueryExpression: 'KeyConditionExpression',
    ScanExpression: 'FilterExpression',
    Aliases: 'ExpressionAttributeNames',
    Index: 'IndexName'
};
var DynamoDBRepoWrapper = (function (_super) {
    __extends(DynamoDBRepoWrapper, _super);
    function DynamoDBRepoWrapper(store, repoClazzName, repoClazz) {
        var _this = this;
        _super.call(this, repoClazz, new repoClazz().modelClazz);
        this.store = store;
        this.repoClazzName = repoClazzName;
        this.repoClazz = repoClazz;
        assert(repoClazz && repoClazz.prototype, 'Repo class is required and must have a valid prototype');
        this.manager = this.store.manager;
        var modelOptions = this.store.manager.getModel(this.modelClazz);
        // Grab the table definition
        this.tableDef = this.store.tableDefinition(modelOptions.name);
        // Grab a mapper
        this.mapper = this.store.manager.getMapper(this.modelClazz);
        var repoType = this.repoType = repoClazz.prototype;
        var finderKeys = Reflect.getMetadata(TypeStoreFindersKey, repoType);
        if (finderKeys) {
            finderKeys.forEach(function (finderKey) { return _this.makeFinder(finderKey); });
        }
    }
    Object.defineProperty(DynamoDBRepoWrapper.prototype, "tableName", {
        get: function () {
            return this.tableDef.TableName;
        },
        enumerable: true,
        configurable: true
    });
    DynamoDBRepoWrapper.prototype.makeParams = function (params) {
        if (params === void 0) { params = {}; }
        return Object.assign({
            TableName: this.tableName
        }, params);
    };
    DynamoDBRepoWrapper.prototype.makeFinder = function (finderKey) {
        var _this = this;
        var finderOpts = Reflect.getMetadata(DynamoDBStore_1.DynamoDBFinderKey, this.repoType, finderKey);
        if (!finderOpts) {
            log.debug(finderKey + " is not a dynamo finder, no dynamo finder options");
            return _super.prototype.makeFinder.call(this, finderKey);
        }
        log.debug("Making finder " + finderKey + ":", finderOpts);
        var type = finderOpts.type || DynamoDBTypes_1.DynamoDBFinderType.Query;
        var defaultParams = this.makeParams();
        var valuesOpt = finderOpts.values;
        var valueMapper = function (args) {
            if (valuesOpt) {
                return (_.isFunction(valuesOpt)) ?
                    // If its a function then execute it
                    valuesOpt.apply(void 0, args) :
                    // If its an array map it by index
                    (Array.isArray(valuesOpt)) ? (function () {
                        var values = {};
                        var argNameList = valuesOpt;
                        argNameList.forEach(function (valueOpt, index) {
                            values[(":" + valueOpt)] = args[index];
                        });
                    }) :
                        // if its an object - good luck
                        valuesOpt;
            }
            return {};
        };
        Object.keys(finderOpts).forEach(function (key) {
            var val = finderOpts[key];
            var awsKey = key.charAt(0).toUpperCase() + key.substring(1);
            var mappedKey = MappedFinderParams[awsKey];
            if (mappedKey) {
                defaultParams[mappedKey] = val;
            }
        });
        // Create the finder function
        this.setFinder(finderKey, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            //params.ExpressionsAttributeValues
            var params = _.assign(_.clone(defaultParams), {
                ExpressionAttributeValues: valueMapper(args)
            });
            // Find or scan
            return ((type === DynamoDBTypes_1.DynamoDBFinderType.Query) ?
                _this.store.query(params) :
                _this.store.scan(params)).then(function (results) {
                return results.Items.map(function (item) { return _this.mapper.fromObject(item); });
            });
        });
    };
    DynamoDBRepoWrapper.prototype.key = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        assert(args && args.length > 0 && args.length < 3, 'Either 1 or two parameters can be used to create dynamo keys');
        return new DynamoDBStore_1.DynamoDBKeyValue(this.tableDef.KeySchema, args[0], args[1]);
    };
    DynamoDBRepoWrapper.prototype.get = function (key) {
        var _this = this;
        return this.store.get(this.makeParams({
            Key: key.toParam()
        })).then(function (result) {
            return _this.mapper.fromObject(result.Item);
        });
    };
    DynamoDBRepoWrapper.prototype.save = function (o) {
        return this.store.put(this.makeParams({ Item: o }))
            .then(function (result) {
            return o;
        });
    };
    DynamoDBRepoWrapper.prototype.remove = function (key) {
        return this.store.delete(this.makeParams({
            Key: key.toParam()
        }));
    };
    DynamoDBRepoWrapper.prototype.count = function () {
        return this.store.describeTable(this.tableName)
            .then(function (tableDesc) {
            return tableDesc.ItemCount;
        });
    };
    return DynamoDBRepoWrapper;
}(typestore_1.Repo));
exports.DynamoDBRepoWrapper = DynamoDBRepoWrapper;

//# sourceMappingURL=DynamoDBRepo.js.map
