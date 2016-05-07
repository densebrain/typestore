"use strict";
var Promise = require('../Promise');
global.Promise = Promise;
require('source-map-support').install();
var FakeStore_1 = require("./fixtures/FakeStore");
require('expectations');
require('reflect-metadata');
var Types_1 = require("../Types");
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
    store = new FakeStore_1.FakeStore();
    var opts = {
        syncStrategy: syncStrategy,
        store: store
    };
    delete require['./fixtures/index'];
    return Manager_1.Manager.reset().then(function () {
        log.info('Manager reset, now init');
    })
        .then(function () { return Manager_1.Manager.init(opts); })
        .then(function () {
        Fixtures = require('./fixtures/index');
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
            var test1 = new Fixtures.Test1();
            var constructorFn = test1.constructor.prototype;
            expect(constructorFn).toBe(Fixtures.Test1.prototype);
            var attrData = Reflect.getOwnMetadata(Constants_1.DynoAttrKey, constructorFn), modelData = Reflect.getOwnMetadata(Constants_1.DynoModelKey, constructorFn);
            expect(attrData.length).toEqual(3);
            expect(modelData.attrs.length).toEqual(3);
        });
    });
    //
    // describe('#store',() => {
    // 	beforeEach(() => {
    // 		return reset(SyncStrategy.Overwrite)
    // 	})
    //
    // 	it("#sync",() => {
    // 		const test1 = new Fixtures.Test1()
    // 		return Manager.start().then(() => {
    // 			expect(store.availableTables.length).toBe(1)
    //
    // 		})
    // 	})
    //
    // 	describe('#repo',() => {
    // 		let t1 = null
    // 		let test1Repo = null
    // 		before(() => {
    // 			t1 = new Fixtures.Test1()
    // 			t1.id = uuid.v4()
    // 			t1.createdAt = new Date().getTime()
    // 			t1.randomText = 'asdfasdfadsf'
    //
    // 			return Manager.start().then(() => {
    // 				test1Repo = Manager.getRepo(Fixtures.Test1Repo)
    // 			})
    // 		})
    //
    // 		it('#create', () => {
    // 			return test1Repo.save(t1)
    // 				.then(() => test1Repo.count())
    // 				.then((rowCount) => {
    // 					expect(rowCount).toBe(1)
    // 				})
    //
    // 		})
    //
    // 		it('#get',() => {
    // 			return test1Repo.get(test1Repo.key(t1.id,t1.createdAt))
    // 				.then((t2) => {
    // 					expect(t1.id).toBe(t2.id)
    // 					expect(t1.createdAt).toBe(t2.createdAt)
    // 					expect(t1.randomText).toBe(t2.randomText)
    // 				})
    //
    // 		})
    //
    // 		it('#finder',() => {
    // 			return test1Repo.findByRandomText('asdfasdfadsf')
    // 				.then((items) => {
    // 					expect(items.length).toBe(1)
    // 					const t2 = items[0]
    // 					expect(t1.id).toBe(t2.id)
    // 					expect(t1.createdAt).toBe(t2.createdAt)
    // 					expect(t1.randomText).toBe(t2.randomText)
    // 				})
    // 		})
    //
    // 		it('#delete',() => {
    // 			return test1Repo.remove(test1Repo.key(t1.id,t1.createdAt))
    // 				.then(() => test1Repo.count())
    // 				.then((rowCount) => {
    // 					expect(rowCount).toBe(0)
    // 				})
    //
    // 		})
    // 	})
    //})
});

//# sourceMappingURL=Manager.spec.js.map
