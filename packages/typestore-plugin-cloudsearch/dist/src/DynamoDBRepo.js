"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var typestore_1 = require('typestore');
var assert = require('assert');
var _ = require('lodash');
var DynamoDBStore_1 = require("./DynamoDBStore");
var DynamoDBTypes_1 = require("./DynamoDBTypes");
var IncorrectKeyTypeError = typestore_1.Errors.IncorrectKeyTypeError;
var DynoFindersKey = typestore_1.Constants.DynoFindersKey;

var log = typestore_1.Log.create(__filename);
var MappedFinderParams = {
    Projection: 'ProjectionExpression',
    QueryExpression: 'KeyConditionExpression',
    ScanExpression: 'FilterExpression',
    Aliases: 'ExpressionAttributeNames',
    Index: 'IndexName'
};

var DynamoDBRepo = function (_typestore_1$Repo) {
    _inherits(DynamoDBRepo, _typestore_1$Repo);

    function DynamoDBRepo(store, repoClazzName, repoClazz) {
        _classCallCheck(this, DynamoDBRepo);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DynamoDBRepo).call(this, new repoClazz().modelClazz));

        _this.store = store;
        _this.repoClazzName = repoClazzName;
        _this.repoClazz = repoClazz;
        assert(repoClazz && repoClazz.prototype, 'Repo class is required and must have a valid prototype');
        var repoType = _this.repoType = repoClazz.prototype;
        var repoTypeKeys = Reflect.getOwnMetadataKeys(repoType);
        log.debug('Repo type (' + _this.repoClazzName + ' keys: ' + repoTypeKeys.join(', '));
        // Grab the table definition
        _this.tableDef = _this.store.tableDefinition(_this.modelClazz.name);
        // Grab a mapper
        _this.mapper = _this.store.manager.getMapper(_this.modelClazz);
        var finderKeys = Reflect.getMetadata(DynoFindersKey, repoType);
        if (finderKeys) {
            finderKeys.forEach(function (finderKey) {
                return _this.makeFinder(finderKey);
            });
        }
        log.info('Building repo');
        return _this;
    }

    _createClass(DynamoDBRepo, [{
        key: 'makeParams',
        value: function makeParams() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return Object.assign({
                TableName: this.tableName
            }, params);
        }
    }, {
        key: 'makeFinder',
        value: function makeFinder(finderKey) {
            var _this2 = this;

            var finderOpts = Reflect.getMetadata(DynamoDBStore_1.DynamoDBFinderKey, this.repoType, finderKey);
            log.debug('Making finder ' + finderKey + ':', finderOpts);
            var type = finderOpts.type || DynamoDBTypes_1.DynamoDBFinderType.Query;
            var defaultParams = this.makeParams();
            var valuesOpt = finderOpts.values;
            var valueMapper = function valueMapper(args) {
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
            Object.keys(finderOpts).forEach(function (key) {
                var val = finderOpts[key];
                var awsKey = key.charAt(0).toUpperCase() + key.substring(1);
                var mappedKey = MappedFinderParams[awsKey];
                if (mappedKey) {
                    defaultParams[mappedKey] = val;
                }
            });
            // Create the finder function
            this[finderKey] = function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                //params.ExpressionsAttributeValues
                var params = _.assign(_.clone(defaultParams), {
                    ExpressionAttributeValues: valueMapper(args)
                });
                // Find or scan
                return (type === DynamoDBTypes_1.DynamoDBFinderType.Query ? _this2.store.query(params) : _this2.store.scan(params)).then(function (results) {
                    var models = [];
                    results.Items.forEach(function (item) {
                        return models.push(_this2.mapper.fromObject(item));
                    });
                    return models;
                });
            };
        }
    }, {
        key: 'key',
        value: function key() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            assert(args && args.length > 0 && args.length < 3, 'Either 1 or two parameters can be used to create dynamo keys');
            return new DynamoDBStore_1.DynamoDBKeyValue(this.tableDef.KeySchema, args[0], args[1]);
        }
    }, {
        key: 'get',
        value: function get(key) {
            var _this3 = this;

            return this.store.get(this.makeParams({
                Key: key.toParam()
            })).then(function (result) {
                return _this3.mapper.fromObject(result.Item);
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
            return this.store.delete(this.makeParams({
                Key: key.toParam()
            }));
        }
    }, {
        key: 'count',
        value: function count() {
            return this.store.describeTable(this.tableName).then(function (tableDesc) {
                return tableDesc.ItemCount;
            });
        }
    }, {
        key: 'tableName',
        get: function get() {
            return this.tableDef.TableName;
        }
    }]);

    return DynamoDBRepo;
}(typestore_1.Repo);

exports.DynamoDBRepo = DynamoDBRepo;
//# sourceMappingURL=DynamoDBRepo.js.map
