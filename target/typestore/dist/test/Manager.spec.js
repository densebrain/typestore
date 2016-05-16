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
var log = getLogger(__filename);
log.info('Starting test suite');
var Types_1 = require("../Types");
var NullStore_1 = require("./fixtures/NullStore");
var Coordinator_1 = require('../Coordinator');
var Constants_1 = require('../Constants');
var Fixtures = require('./fixtures/Fixtures');
var coordinator = null;
/**
 * Reset TypeStore and start all over
 *
 * @param syncStrategy
 * @returns {Bluebird<U>}
 */
function reset(syncStrategy) {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        log.info('Coordinator reset, now init');

                        if (!coordinator) {
                            _context.next = 4;
                            break;
                        }

                        _context.next = 4;
                        return coordinator.stop();

                    case 4:
                        coordinator = new Coordinator_1.Coordinator();
                        _context.next = 7;
                        return coordinator.init(new Types_1.CoordinatorOptions({ syncStrategy: syncStrategy }), new NullStore_1.NullStore());

                    case 7:
                        return _context.abrupt("return", _context.sent);

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
/**
 * Global test suite
 */
describe('#typestore-model-decorations', function () {
    beforeEach(function () {
        return reset(Types_1.SyncStrategy.None);
    });
    it('#model', function () {
        return __awaiter(undefined, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
            var constructorFn, attrData, modelData;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return coordinator.start(Fixtures.ModelTest1);

                        case 2:
                            //new Fixtures.ModelTest1()
                            constructorFn = Fixtures.ModelTest1;

                            expect(constructorFn).toBe(Fixtures.ModelTest1);
                            attrData = Reflect.getOwnMetadata(Constants_1.TypeStoreAttrKey, constructorFn), modelData = Reflect.getOwnMetadata(Constants_1.TypeStoreModelKey, constructorFn);

                            expect(attrData.length).toEqual(3);
                            expect(modelData.attrs.length).toEqual(3);

                        case 7:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
    });
});
//# sourceMappingURL=Manager.spec.js.map
