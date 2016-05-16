"use strict";

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
Promise = require('bluebird');
var AWS = require('aws-sdk');
var log = getLogger(__filename);
var sharedIniCreds = new AWS.SharedIniFileCredentials({ profile: 'default' });
var Faker = require('faker');
var index_1 = require('./fixtures/index');
var sinon = require('sinon');
var uuid = require('node-uuid');
var typestore_1 = require('typestore');
var typestore_mocks_1 = require("typestore-mocks");
var CloudSearchProviderPlugin_1 = require("../CloudSearchProviderPlugin");
var CloudSearchConstants_1 = require("../CloudSearchConstants");
var coordinator = null;
/**
 * Make the cloud search plugin
 */
var cloudSearchProvider = new CloudSearchProviderPlugin_1.CloudSearchProviderPlugin({
    endpoint: CloudSearchConstants_1.CloudSearchLocalEndpoint,
    awsOptions: {
        region: 'us-east-1',
        credentials: sharedIniCreds
    }
}, index_1.CloudSearchTestModel);
/**
 * Create a mock store for managing the model instances
 *
 * @type {MockStore}
 */
var store = new typestore_mocks_1.MockStore(index_1.CloudSearchTestModel);
/**
 * Global test suite
 *
 * TODO: Somehow integrated mocked service
 */
describe('#plugin-cloudsearch', function () {
    var t1 = null;
    function getTestModel() {
        t1 = new index_1.CloudSearchTestModel();
        t1.id = uuid.v4();
        t1.date = new Date();
        t1.text = Faker.lorem.words(15);
    }
    /**
     * Set it up
     */
    before(function () {
        return __awaiter(undefined, void 0, void 0, regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!coordinator) {
                                _context.next = 3;
                                break;
                            }

                            _context.next = 3;
                            return coordinator.stop();

                        case 3:
                            coordinator = new typestore_1.Coordinator();
                            _context.next = 6;
                            return coordinator.init({}, store, cloudSearchProvider);

                        case 6:
                            _context.next = 8;
                            return coordinator.start(index_1.CloudSearchTestModel);

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    });
    /**
     * Creates a valid table definition
     */
    describe('#indexer', function () {
        it('#add', function () {
            getTestModel();
            var repo = coordinator.getRepo(index_1.CloudSearchTest1Repo);
            //const mock = sinon.mock(repo)
            var stub = sinon.stub(repo, 'save', function (o) {
                expect(o.id).toBe(t1.id);
                return this.index(typestore_1.IndexAction.Add, o);
            });
            //mock.expects('save').once()
            return repo.save(t1);
        });
        it('#remove', function () {
            var repo = coordinator.getRepo(index_1.CloudSearchTest1Repo);
            var stub = sinon.stub(repo, 'remove', function (o) {
                log.info('Fake remove object', o);
                expect(o.id).toBe(t1.id);
                return this.index(typestore_1.IndexAction.Remove, o);
            });
            //const mock = sinon.mock(repo)
            //mock.expects('remove').once()
            return repo.remove(t1); //.then(() => mock.verify())
        });
    });
    describe('#search', function () {
        it('#add+search+remove', function () {
            return __awaiter(undefined, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                var repo, stub, t2, searchResults;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                getTestModel();
                                repo = coordinator.getRepo(index_1.CloudSearchTest1Repo);
                                //const mock = sinon.mock(repo)

                                stub = sinon.stub(repo, 'save', function (o) {
                                    expect(o.id).toBe(t1.id);
                                    return this.index(typestore_1.IndexAction.Add, o);
                                });
                                _context2.next = 5;
                                return repo.save(t1);

                            case 5:
                                t2 = _context2.sent;
                                _context2.next = 8;
                                return repo.findByText(t1.text.split(' ')[0]);

                            case 8:
                                searchResults = _context2.sent;

                                expect(searchResults.length).toBeGreaterThan(0);
                                log.info(searchResults);
                                return _context2.abrupt('return', true);

                            case 12:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        });
    });
});
//# sourceMappingURL=CloudSearchProvider.spec.js.map
