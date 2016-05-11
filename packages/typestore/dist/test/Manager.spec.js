"use strict";
require('source-map-support').install();
var Log = require('../log');
if (!process.env.DEBUG)
    Log.setLogThreshold(Log.LogLevel.WARN);
require('expectations');
require('reflect-metadata');
var Types_1 = require("../Types");
var NullStore_1 = require("./fixtures/NullStore");
var Coordinator_1 = require('../Coordinator');
var Constants_1 = require('../Constants');
var log = Log.create(__filename);
log.info('Starting test suite');
var Fixtures = null;
var store = null;
/**
 * Reset TypeStore and start all over
 *
 * @param syncStrategy
 * @returns {Bluebird<U>}
 */
function reset(syncStrategy) {
    store = new NullStore_1.NullStore();
    var opts = new Types_1.CoordinatorOptions({
        syncStrategy: syncStrategy
    });
    delete require['./fixtures/Fixtures'];
    return Coordinator_1.Coordinator.reset().then(function () {
        log.info('Coordinator reset, now init');
    })
        .then(function () { return Coordinator_1.Coordinator.init(opts, store); })
        .then(function () {
        Fixtures = require('./fixtures/Fixtures');
    });
}
/**
 * Global test suite
 */
describe('#typestore', function () {
    /**
     * Test for valid decorations
     */
    describe('#decorators', function () {
        beforeEach(function () {
            return reset(Types_1.SyncStrategy.None);
        });
        it('#model', function () {
            Coordinator_1.Coordinator.start(Fixtures.ModelTest1);
            var test1 = new Fixtures.ModelTest1();
            var constructorFn = Fixtures.ModelTest1;
            expect(constructorFn).toBe(Fixtures.ModelTest1);
            var attrData = Reflect.getOwnMetadata(Constants_1.TypeStoreAttrKey, constructorFn), modelData = Reflect.getOwnMetadata(Constants_1.TypeStoreModelKey, constructorFn);
            expect(attrData.length).toEqual(3);
            expect(modelData.attrs.length).toEqual(3);
        });
    });
});

//# sourceMappingURL=Manager.spec.js.map
