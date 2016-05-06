"use strict";
require('source-map-support').install();
var uuid = require('node-uuid');
require('expectations');
require('reflect-metadata');
var Types_1 = require("../Types");
var DynamoDBStore_1 = require('../DynamoDBStore');
var index_1 = require('../index');
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
function reset(syncStrategy, endpoint) {
    // Init dynamo type
    // using local
    store = new DynamoDBStore_1.DynamoDBStore();
    var opts = {
        dynamoEndpoint: endpoint,
        prefix: "test_" + process.env.USER + "_",
        syncStrategy: syncStrategy,
        store: store
    };
    if (!endpoint)
        delete opts['endpoint'];
    delete require['./fixtures/index'];
    return index_1.Manager.reset().then(function () {
        log.info('Manager reset, now init');
    })
        .then(function () { return index_1.Manager.init(opts); })
        .then(function () {
        Fixtures = require('./fixtures/index');
    });
}
/**
 * Global test suite
 */
describe('DynoType', function () {
    /**
     * Test for valid decorations
     */
    describe('#decorators', function () {
        beforeEach(function () {
            return reset(Types_1.SyncStrategy.None, Constants_1.DynamoDBLocalEndpoint);
        });
        it('#model', function () {
            var test1 = new Fixtures.Test1();
            var constructorFn = test1.constructor.prototype;
            expect(constructorFn).toBe(Fixtures.Test1.prototype);
            var attrData = Reflect.getOwnMetadata(Constants_1.DynoAttrKey, constructorFn), modelData = Reflect.getOwnMetadata(Constants_1.DynoModelKey, constructorFn);
            expect(attrData.length).toEqual(3);
            expect(modelData.attrs.length).toEqual(3);
        });
        /**
         * Creates a valid table definition
         */
        it('#tableDef', function () {
            new Fixtures.Test1();
            var modelOpts = index_1.Manager.findModelOptionsByClazz(Fixtures.Test1);
            var tableDef = store.tableDefinition(modelOpts.clazzName);
            expect(tableDef.KeySchema.length).toBe(2);
            expect(tableDef.AttributeDefinitions.length).toBe(3);
            expect(tableDef.AttributeDefinitions[0].AttributeName).toBe('id');
            expect(tableDef.AttributeDefinitions[0].AttributeType).toBe('S');
        });
    });
    describe('#store', function () {
        beforeEach(function () {
            return reset(Types_1.SyncStrategy.Overwrite, Constants_1.DynamoDBLocalEndpoint);
        });
        it("#sync", function () {
            var test1 = new Fixtures.Test1();
            return index_1.Manager.start().then(function () {
                expect(store.availableTables.length).toBe(1);
            });
        });
        describe('#repo', function () {
            var t1 = null;
            var test1Repo = null;
            before(function () {
                t1 = new Fixtures.Test1();
                t1.id = uuid.v4();
                t1.createdAt = new Date().getTime();
                t1.randomText = 'asdfasdfadsf';
                return index_1.Manager.start().then(function () {
                    test1Repo = index_1.Manager.getRepo(Fixtures.Test1Repo);
                });
            });
            it('#create', function () {
                return test1Repo.save(t1)
                    .then(function () { return test1Repo.count(); })
                    .then(function (rowCount) {
                    expect(rowCount).toBe(1);
                });
            });
            it('#get', function () {
                return test1Repo.get(test1Repo.key(t1.id, t1.createdAt))
                    .then(function (t2) {
                    expect(t1.id).toBe(t2.id);
                    expect(t1.createdAt).toBe(t2.createdAt);
                    expect(t1.randomText).toBe(t2.randomText);
                });
            });
            it('#finder', function () {
                return test1Repo.findByRandomText('asdfasdfadsf')
                    .then(function (items) {
                    expect(items.length).toBe(1);
                    var t2 = items[0];
                    expect(t1.id).toBe(t2.id);
                    expect(t1.createdAt).toBe(t2.createdAt);
                    expect(t1.randomText).toBe(t2.randomText);
                });
            });
            it('#delete', function () {
                return test1Repo.remove(test1Repo.key(t1.id, t1.createdAt))
                    .then(function () { return test1Repo.count(); })
                    .then(function (rowCount) {
                    expect(rowCount).toBe(0);
                });
            });
        });
    });
});

//# sourceMappingURL=Manager.spec.js.map
