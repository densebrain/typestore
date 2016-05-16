"use strict";

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
/// <reference path="../typings/typestore-example-webpack.d.ts"/>
require('reflect-metadata');
var assert = require('assert');
// - we like bluebird because it makes debugging WAY easier
// - this is totally up to you - but we suggest it ;)
Promise = require('bluebird');
var dexie_1 = require('dexie');
// Import all the required core libraries
var typestore_1 = require('typestore');
// Import the cloud search specific stuff
var typestore_plugin_indexeddb_1 = require('typestore-plugin-indexeddb');
// There is a whole logging framework you are welcome to use
// as well - but it could do with docs - pull request?? ;)
var log = typestore_1.Log.create(__filename);
function logToBody() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    document.getElementById('body').innerHTML += "<br/>" + args.join(' ');
    console.log.apply(console, args);
}
typestore_1.Log.setLoggerOutput(logToBody);
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
__decorate([typestore_1.AttributeDescriptor({ name: 'year' }), __metadata('design:type', Number)], Car.prototype, "year", void 0);
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

    return CarRepo;
}(typestore_1.Repo);
CarRepo = CarRepo_1 = __decorate([typestore_1.RepoDescriptor(), __metadata('design:paramtypes', [])], CarRepo);
function runCars() {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
        var idbOpts, dbToDelete, idbStore, coordinator, car1, repo1, carCount, car1Key, car1FromRepo;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        idbOpts = {
                            databaseName: 'cars-db'
                        };
                        dbToDelete = new dexie_1.default(idbOpts.databaseName);
                        _context.next = 4;
                        return dbToDelete.delete();

                    case 4:
                        idbStore = new typestore_plugin_indexeddb_1.IndexedDBPlugin(idbOpts, Car);
                        // Create a coordinator

                        coordinator = new typestore_1.Coordinator();
                        // Initialize it with all plugins

                        _context.next = 8;
                        return coordinator.init({
                            syncStrategy: typestore_1.SyncStrategy.Overwrite
                        }, idbStore);

                    case 8:
                        _context.next = 10;
                        return coordinator.start(Car);

                    case 10:
                        car1 = new Car({
                            manufacturer: 'volvo',
                            year: 1956,
                            model: '740gle',
                            tagLine: 'old school'
                        });
                        repo1 = coordinator.getRepo(CarRepo);
                        _context.next = 14;
                        return repo1.save(car1);

                    case 14:
                        car1 = _context.sent;

                        log.info('Car saved');
                        _context.next = 18;
                        return repo1.count();

                    case 18:
                        carCount = _context.sent;

                        assert(carCount === 1, 'only 1 car in there today!');
                        log.info('Car count = 1');
                        car1Key = repo1.key(car1.manufacturer);
                        _context.next = 24;
                        return repo1.get(car1Key);

                    case 24:
                        car1FromRepo = _context.sent;

                        assert(car1FromRepo.manufacturer === car1.manufacturer && car1FromRepo.year === car1.year && car1FromRepo.model === car1.model, "These should be identical\n" + JSON.stringify(car1, null, 4) + " \n\t\t\tfrom repo \n" + JSON.stringify(car1FromRepo, null, 4));
                        log.info('Car models match');
                        _context.next = 29;
                        return repo1.remove(car1Key);

                    case 29:
                        log.info('Car removed');
                        _context.next = 32;
                        return repo1.count();

                    case 32:
                        carCount = _context.sent;

                        assert(carCount === 0, 'only 1 car in there today!');
                        log.info('Car count 0');
                        log.info('All tests run');
                        return _context.abrupt("return", true);

                    case 37:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.runCars = runCars;
// Execute with runCars() or check spec
//# sourceMappingURL=ExampleRunCarsWebPack.js.map
