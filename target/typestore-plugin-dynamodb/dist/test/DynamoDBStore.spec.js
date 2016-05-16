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
var log = getLogger(__filename);
var uuid = require('node-uuid');
var typestore_1 = require('typestore');
var DynamoDBStorePlugin_1 = require('../DynamoDBStorePlugin');
var Fixtures = require('./fixtures/index');
//Setup DynamoDBLocal
var DynamoDBPort = 8787;
var DynamoDBLocal = require('dynamodb-local');
var DynamoDBLocalEndpoint = 'http://localhost:' + DynamoDBPort;
var store = null;
var coordinator = null;
/**
 * Reset TypeStore and start all over
 *
 * @param syncStrategy
 * @param endpoint
 * @returns {Bluebird<Coordinator>}
 */
function reset(syncStrategy, endpoint) {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
        var opts;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // Init dynamo type
                        // using local
                        opts = {
                            endpoint: endpoint,
                            prefix: 'test_' + process.env.USER + '_'
                        };

                        store = new DynamoDBStorePlugin_1.DynamoDBStorePlugin(opts, Fixtures.Test1);
                        if (!endpoint) delete opts['endpoint'];

                        if (!coordinator) {
                            _context.next = 6;
                            break;
                        }

                        _context.next = 6;
                        return coordinator.stop();

                    case 6:
                        coordinator = new typestore_1.Coordinator();
                        _context.next = 9;
                        return coordinator.init({ syncStrategy: syncStrategy }, store);

                    case 9:
                        return _context.abrupt('return', coordinator);

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
/**
 * Global test suite
 */
describe('#plugin-dynamodb', function () {
    var _this = this;

    this.timeout(60000);
    before(function () {
        return DynamoDBLocal.launch(DynamoDBPort, null, ['-sharedDb']);
    });
    after(function () {
        DynamoDBLocal.stop(DynamoDBPort);
    });
    beforeEach(function () {
        return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return reset(typestore_1.SyncStrategy.Overwrite, DynamoDBLocalEndpoint);

                        case 2:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
    });
    /**
     * Creates a valid table definition
     */
    it('#tableDef', function () {
        return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
            var modelOpts, tableDef;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return coordinator.start(Fixtures.Test1);

                        case 2:
                            modelOpts = coordinator.getModel(Fixtures.Test1);
                            tableDef = store.tableDefinition(modelOpts.name);

                            expect(tableDef.KeySchema.length).toBe(2);
                            expect(tableDef.AttributeDefinitions.length).toBe(3);
                            expect(tableDef.AttributeDefinitions[0].AttributeName).toBe('id');
                            expect(tableDef.AttributeDefinitions[0].AttributeType).toBe('S');

                        case 8:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));
    });
    it("#sync", function () {
        return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return coordinator.start(Fixtures.Test1);

                        case 2:
                            expect(store.availableTables.length).toBeGreaterThan(0);
                            expect(coordinator.getModel(Fixtures.Test1)).not.toBeNull();

                        case 4:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));
    });
    describe('#repo', function () {
        var t1 = null;
        var test1Repo = null;
        before(function () {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                t1 = new Fixtures.Test1();
                                t1.id = uuid.v4();
                                t1.createdAt = new Date().getTime();
                                t1.randomText = 'asdfasdfadsf';
                                _context5.next = 6;
                                return coordinator.start(Fixtures.Test1);

                            case 6:
                                test1Repo = coordinator.getRepo(Fixtures.Test1Repo);

                            case 7:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        });
        it('#create', function () {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
                var rowCount;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return test1Repo.save(t1);

                            case 2:
                                _context6.next = 4;
                                return test1Repo.count();

                            case 4:
                                rowCount = _context6.sent;

                                expect(rowCount).toBe(1);

                            case 6:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        });
        it('#get', function () {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee7() {
                var t2;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return test1Repo.get(test1Repo.key(t1.id, t1.createdAt));

                            case 2:
                                t2 = _context7.sent;

                                expect(t1.id).toBe(t2.id);
                                expect(t1.createdAt).toBe(t2.createdAt);
                                expect(t1.randomText).toBe(t2.randomText);

                            case 6:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));
        });
        it('#finder', function () {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee8() {
                var items, t2;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return test1Repo.findByRandomText('asdfasdfadsf');

                            case 2:
                                items = _context8.sent;

                                expect(items.length).toBe(1);
                                t2 = items[0];

                                expect(t1.id).toBe(t2.id);
                                expect(t1.createdAt).toBe(t2.createdAt);
                                expect(t1.randomText).toBe(t2.randomText);

                            case 8:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));
        });
        it('#delete', function () {
            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee9() {
                var key, rowCount;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                key = test1Repo.key(t1.id, t1.createdAt);

                                log.info('deleting key', key);
                                _context9.next = 4;
                                return test1Repo.remove(key);

                            case 4:
                                _context9.next = 6;
                                return test1Repo.count();

                            case 6:
                                rowCount = _context9.sent;

                                expect(rowCount).toBe(0);

                            case 8:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));
        });
    });
});
//# sourceMappingURL=DynamoDBStore.spec.js.map
