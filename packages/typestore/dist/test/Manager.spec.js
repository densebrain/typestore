"use strict";
require('source-map-support').install();
require('expectations');
require('reflect-metadata');
var Types_1 = require("../Types");
var NullStore_1 = require("./fixtures/NullStore");
var Manager_1 = require('../Manager');
var Constants_1 = require('../Constants');
var Log = require('../log');
var log = Log.create(__filename);
log.info('Starting test suite');
var Fixtures = null;
var store = null;
/**
 * Reset Dynotype and start all over
 *
 * @param syncStrategy
 * @param endpoint
 * @returns {Bluebird<U>}
 */
function reset(syncStrategy) {
    store = new NullStore_1.NullStore();
    var opts = new Types_1.ManagerOptions(store, {
        syncStrategy: syncStrategy,
        store: store
    });
    delete require['./fixtures/Fixtures'];
    return Manager_1.Manager.reset().then(function () {
        log.info('Manager reset, now init');
    })
        .then(function () { return Manager_1.Manager.init(opts); })
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
            Manager_1.Manager.start(Fixtures.ModelTest1);
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
