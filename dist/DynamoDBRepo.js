"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var Log = require('./log');
var _ = require('lodash');
var Repo_1 = require("./Repo");
var DynamoDBStore_1 = require("./DynamoDBStore");
var Constants_1 = require("./Constants");
var DynamoDBTypes_1 = require("./DynamoDBTypes");
var Errors_1 = require("./Errors");
var log = Log.create(__filename);
var MappedFinderParams = {
    Projection: 'ProjectionExpression',
    QueryExpression: 'KeyConditionExpression',
    ScanExpression: 'FilterExpression',
    Aliases: 'ExpressionAttributeNames'
};
var DynamoDBRepo = (function (_super) {
    __extends(DynamoDBRepo, _super);
    function DynamoDBRepo(store, repoClazzName, repoClazz) {
        var _this = this;
        _super.call(this, new repoClazz().modelClazz);
        this.store = store;
        this.repoClazzName = repoClazzName;
        this.repoClazz = repoClazz;
        assert(repoClazz && repoClazz.prototype, 'Repo class is required and must have a valid prototype');
        var repoType = this.repoType = repoClazz.prototype;
        var repoTypeKeys = Reflect.getOwnMetadataKeys(repoType);
        log.debug("Repo type (" + this.repoClazzName + " keys: " + repoTypeKeys.join(', '));
        var finderKeys = Reflect.getMetadata(Constants_1.DynoFindersKey, repoType);
        if (finderKeys) {
            finderKeys.forEach(function (finderKey) { return _this.makeFinder(finderKey); });
        }
        log.info("Building repo");
    }
    DynamoDBRepo.prototype.makeParams = function (params) {
        if (params === void 0) { params = {}; }
        return Object.assign({
            TableName: this.tableName
        }, params);
    };
    DynamoDBRepo.prototype.makeFinder = function (finderKey) {
        var _this = this;
        var finderOpts = Reflect.getMetadata(DynamoDBStore_1.DynamoDBFinderKey, this.repoType, finderKey);
        log.debug("Making finder " + finderKey + ":", finderOpts);
        var type = finderOpts.type || DynamoDBTypes_1.DynamoDBFinderType.Query;
        var defaultParams = this.makeParams();
        var valuesOpt = finderOpts.values;
        var valueMapper = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (valuesOpt) {
                return (_.isFunction(valuesOpt)) ?
                    // If its a function then execute it
                    valuesOpt(args) :
                    // If its an array map it by index
                    (_.isArray(valuesOpt)) ? function () {
                        var values = {};
                        _.forEach(valuesOpt, function (valueOpt, index) {
                            values[valueOpt] = args[index];
                        });
                    } :
                        // if its an object - good luck
                        valuesOpt;
            }
            return {};
        };
        Object.keys(finderOpts).forEach(function (key) {
            var val = finderOpts[key];
            var awsKey = _.capitalize(key);
            var mappedKey = MappedFinderParams[awsKey];
            if (mappedKey) {
                defaultParams[mappedKey] = val;
            }
        });
        this[finderKey] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            //params.ExpressionsAttributeValues
            var params = _.assign(_.clone(defaultParams), {
                ExpressionsAttributeValues: valueMapper(args)
            });
            // Find or scan
            var results = (type === DynamoDBTypes_1.DynamoDBFinderType.Query) ?
                _this.store.query(params) :
                _this.store.scan(params);
        };
    };
    DynamoDBRepo.prototype.key = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        assert(args && args.length > 0 && args.length < 3, 'Either 1 or two parameters can be used to create dynamo keys');
        var tableDef = this.store.tableDefinition(this.modelClazz.name);
        return new DynamoDBStore_1.DynamoDBKeyValue(tableDef.KeySchema, args[0], args[1]);
    };
    DynamoDBRepo.prototype.get = function (key) {
        var _this = this;
        if (key instanceof DynamoDBStore_1.DynamoDBKeyValue)
            this.store.get(this.makeParams({
                Key: key.toParam()
            })).then(function (result) {
                //TODO: Assign item data to model
                return _this.newModel();
            });
        throw new Errors_1.IncorrectKeyTypeError("Expected " + DynamoDBStore_1.DynamoDBKeyValue.name);
    };
    DynamoDBRepo.prototype.save = function (o) {
        return this.store.put(this.makeParams({ Item: o }))
            .then(function (result) {
            //TODO: IMplement item data to model
            return o;
        });
    };
    DynamoDBRepo.prototype.remove = function (key) {
        return null;
    };
    return DynamoDBRepo;
}(Repo_1.Repo));
exports.DynamoDBRepo = DynamoDBRepo;

//# sourceMappingURL=DynamoDBRepo.js.map
