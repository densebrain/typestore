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
var uuid = require('node-uuid');
var FakeIndexedDB = require('fake-indexeddb');
var FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
var typestore_1 = require('typestore');
var Fixtures = require('./fixtures/IndexDBTestModel');
var Faker = require('faker');
var IndexedDBPlugin_1 = require("../IndexedDBPlugin");
var log = getLogger(__filename);
//Setup DynamoDBLocal
var coordinator = null;
var store = null;
var storeOpts = {
    databaseName: 'test3-database-' + uuid.v4(),
    provider: {
        indexedDB: FakeIndexedDB,
        IDBKeyRange: FDBKeyRange
    }
};
/**
 * Reset TypeStore and start all over
 *
 * @returns {Bluebird<Coordinator>}
 */
function reset() {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // Init dynamo type
                        // using local
                        store = new IndexedDBPlugin_1.IndexedDBPlugin(storeOpts);

                        if (!coordinator) {
                            _context.next = 4;
                            break;
                        }

                        _context.next = 4;
                        return coordinator.reset();

                    case 4:
                        coordinator = new typestore_1.Coordinator();
                        _context.next = 7;
                        return coordinator.init({}, store);

                    case 7:
                        return _context.abrupt('return', coordinator);

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
describe('#plugin-indexeddb', function () {
    before(function () {
        return __awaiter(undefined, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return reset();

                        case 2:
                            _context2.next = 4;
                            return coordinator.start(Fixtures.IDBModel1);

                        case 4:
                            return _context2.abrupt('return', true);

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
    });
    it('#open', function () {
        return __awaiter(undefined, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            expect(store.db.tables.length).toBe(1);
                            expect(store.db.name).toBe(storeOpts.databaseName);

                        case 2:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));
    });
    it('#puts', function () {
        return __awaiter(undefined, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
            var model, repo, key, modelGet;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            model = new Fixtures.IDBModel1();
                            repo = coordinator.getRepo(Fixtures.IDBRepo1);

                            Object.assign(model, {
                                id: uuid.v4(),
                                createdAt: Faker.date.past(),
                                randomText: Faker.lorem.words(10)
                            });
                            _context4.next = 5;
                            return repo.save(model);

                        case 5:
                            key = repo.key(model.id);
                            _context4.next = 8;
                            return Promise.resolve(repo.get(key));

                        case 8:
                            modelGet = _context4.sent;

                            expect(modelGet.id).toBe(model.id);
                            expect(modelGet.randomText).toBe(model.randomText);
                            _context4.next = 13;
                            return repo.count();

                        case 13:
                            _context4.t0 = _context4.sent;
                            expect(_context4.t0).toBe(1);
                            _context4.next = 17;
                            return repo.remove(key);

                        case 17:
                            _context4.next = 19;
                            return repo.count();

                        case 19:
                            _context4.t1 = _context4.sent;
                            expect(_context4.t1).toBe(0);

                        case 21:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));
    });
    it('#finder', function () {
        return __awaiter(undefined, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
            var model, repo, key, secondWord, results;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            model = new Fixtures.IDBModel1();
                            repo = coordinator.getRepo(Fixtures.IDBRepo1);

                            Object.assign(model, {
                                id: uuid.v4(),
                                createdAt: Faker.date.past(),
                                randomText: Faker.lorem.words(10)
                            });
                            _context5.next = 5;
                            return repo.save(model);

                        case 5:
                            key = repo.key(model.id);
                            secondWord = model.randomText.split(' ')[2];
                            _context5.next = 9;
                            return repo.findByRandomTest(secondWord);

                        case 9:
                            results = _context5.sent;

                            expect(results.length).toBe(1);
                            _context5.next = 13;
                            return repo.remove(key);

                        case 13:
                            _context5.next = 15;
                            return repo.count();

                        case 15:
                            _context5.t0 = _context5.sent;
                            expect(_context5.t0).toBe(0);

                        case 17:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));
    });
});
//# sourceMappingURL=IndexedDBPlugin.spec.js.map
