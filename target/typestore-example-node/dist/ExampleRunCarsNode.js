"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
/// <reference path="../typings/typestore-example-node.d.ts"/>
require('reflect-metadata');
var assert = require('assert');
// - we like bluebird because it makes debugging WAY easier
// - this is totally up to you - but we suggest it ;)
Promise = require('bluebird');
// We dont use the typings here - but you are welcome to
// we are ONLY using it for credential config as you
// will see
var AWS = require('aws-sdk');
// Make sure you have credentials setup
var awsCredentialChain = new AWS.CredentialProviderChain();
awsCredentialChain.providers.push(new AWS.SharedIniFileCredentials({ profile: 'default' }));
awsCredentialChain.providers.push(new AWS.EnvironmentCredentials("AWS"));
// Import all the required core libraries
var typestore_1 = require('typestore');
// Import the cloud search specific stuff
var typestore_plugin_cloudsearch_1 = require('typestore-plugin-cloudsearch');
var typestore_plugin_dynamodb_1 = require('typestore-plugin-dynamodb');
// There is a whole logging framework you are welcome to use
// as well - but it could do with docs - pull request?? ;)
var log = typestore_1.Log.create(__filename);
// Define a model, in this case we extend default model
// but you just have to implement IModel,
// which exposes a single get property clazzName
// so this is simple for convience
// @see https://github.com/densebrain/typestore/blob/master/packages/typestore/src/decorations/ModelDecorations.ts
var Car = function (_typestore_1$DefaultM) {
    _inherits(Car, _typestore_1$DefaultM);

    /**
     * Empty constructor - simply used to call
     * the super constructor - empty is fine
     */

    function Car() {
        var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Car);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Car).call(this));

        log.info("constructor for " + _this.constructor.name);
        Object.assign(_this, props);
        return _this;
    }

    return Car;
}(typestore_1.DefaultModel);
__decorate([typestore_1.AttributeDescriptor({ name: 'manufacturer', primaryKey: true }), __metadata('design:type', String)], Car.prototype, "manufacturer", void 0);
__decorate([typestore_1.AttributeDescriptor({ name: 'year', secondaryKey: true }), __metadata('design:type', Number)], Car.prototype, "year", void 0);
__decorate([typestore_1.AttributeDescriptor({
    name: 'model',
    index: {
        name: 'ModelIndex'
    }
}), __metadata('design:type', String)], Car.prototype, "model", void 0);
__decorate([typestore_1.AttributeDescriptor({
    name: 'tagLine',
    index: {
        name: 'TagLineIndex'
    }
}), __metadata('design:type', String)], Car.prototype, "tagLine", void 0);
Car = __decorate([typestore_1.ModelDescriptor({ tableName: 'test_cars' }), __metadata('design:paramtypes', [Object])], Car);
// Now we've got a model, we need a repo to service the model
var CarRepo_1 = void 0;
var CarRepo = CarRepo_1 = function (_typestore_1$Repo) {
    _inherits(CarRepo, _typestore_1$Repo);

    /**
     * Repo is initialized with the final implementing
     * class and the model class its servicing
     */

    function CarRepo() {
        _classCallCheck(this, CarRepo);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CarRepo).call(this, CarRepo_1, Car));
    }
    // This decoration must come before @FinderDescriptor
    // simply specifies details and options specifically for
    // Dynamo DB's finder implementation - any store/plugin
    // can still implement this, and have other decorations
    // as well


    _createClass(CarRepo, [{
        key: "findByTagLine",
        value: function findByTagLine(text) {
            //Empty implementation - it's implemented
            //when the repo is initialized - anything
            //in here is lost
            return null;
        }
    }, {
        key: "findByTagLineFullText",
        value: function findByTagLineFullText(text) {
            return null;
        }
    }]);

    return CarRepo;
}(typestore_1.Repo);
__decorate([typestore_plugin_dynamodb_1.DynamoDBFinderDescriptor({
    queryExpression: "tagLine = :tagLine",
    index: 'TagLineIndex',
    // values could be ['tagLine'] with the same effect
    // values can be Array<string> or Function
    values: function values() {
        return {
            ':tagLine': arguments.length <= 0 ? undefined : arguments[0]
        };
    }
}), typestore_1.FinderDescriptor(), __metadata('design:type', Function), __metadata('design:paramtypes', [String]), __metadata('design:returntype', Promise)], CarRepo.prototype, "findByTagLine", null);
__decorate([typestore_plugin_cloudsearch_1.CloudSearchFinderDescriptor({
    resultType: Object,
    resultKeyMapper: typestore_1.DefaultKeyMapper('id')
}), typestore_1.FinderDescriptor(), __metadata('design:type', Function), __metadata('design:paramtypes', [String]), __metadata('design:returntype', Promise)], CarRepo.prototype, "findByTagLineFullText", null);
CarRepo = CarRepo_1 = __decorate([typestore_1.RepoDescriptor(), __metadata('design:paramtypes', [])], CarRepo);
function runCars() {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
        var cloudSearchProvider, dynamoStore, coordinator, car1, repo1, carCount, car1Key, car1FromRepo;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // Pass in options and the indexer/search
                        // will service as a rest array
                        cloudSearchProvider = new typestore_plugin_cloudsearch_1.CloudSearchProviderPlugin({
                            endpoint: typestore_plugin_cloudsearch_1.CloudSearchLocalEndpoint,
                            awsOptions: {
                                region: 'us-east-1',
                                credentials: awsCredentialChain
                            }
                        }, Car);
                        // Pass in options and the models that the store
                        // will service as a rest array

                        dynamoStore = new typestore_plugin_dynamodb_1.DynamoDBStorePlugin({
                            endpoint: typestore_plugin_dynamodb_1.DynamoDBLocalEndpoint,
                            prefix: "examples_cars_" + process.env.USER + "_"
                        }, Car);
                        // Create a coordinator

                        coordinator = new typestore_1.Coordinator();
                        // Initialize it with all plugins

                        _context.next = 5;
                        return coordinator.init({
                            syncStrategy: typestore_1.SyncStrategy.Overwrite
                        }, dynamoStore, cloudSearchProvider);

                    case 5:
                        _context.next = 7;
                        return coordinator.start(Car);

                    case 7:
                        car1 = new Car({
                            manufacturer: 'volvo',
                            year: 1956,
                            model: '740gle',
                            tagLine: 'old school'
                        });
                        repo1 = coordinator.getRepo(CarRepo);
                        _context.next = 11;
                        return repo1.save(car1);

                    case 11:
                        car1 = _context.sent;
                        _context.next = 14;
                        return repo1.count();

                    case 14:
                        carCount = _context.sent;

                        assert(carCount === 1, 'only 1 car in there today!');
                        car1Key = repo1.key(car1.manufacturer, car1.year);
                        _context.next = 19;
                        return repo1.get(car1Key);

                    case 19:
                        car1FromRepo = _context.sent;

                        assert(car1FromRepo.manufacturer === car1.manufacturer && car1FromRepo.year === car1.year && car1FromRepo.model === car1.model, "These should be identical\n" + JSON.stringify(car1, null, 4) + " \n\t\t\tfrom repo \n" + JSON.stringify(car1FromRepo, null, 4));
                        _context.next = 23;
                        return repo1.remove(car1Key);

                    case 23:
                        _context.next = 25;
                        return repo1.count();

                    case 25:
                        carCount = _context.sent;

                        assert(carCount === 0, 'only 1 car in there today!');
                        return _context.abrupt("return", true);

                    case 28:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.runCars = runCars;
// Execute with runCars() or check spec
//# sourceMappingURL=ExampleRunCarsNode.js.map
