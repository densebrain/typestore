"use strict";
require('source-map-support').install();
require('expectations');
require('reflect-metadata');
var uuid = require('node-uuid');
var typestore_1 = require('typestore');
if (!process.env.DEBUG)
    typestore_1.Log.setLogThreshold(typestore_1.Log.LogLevel.WARN);
var DynamoDBStore_1 = require('../DynamoDBStore');
var log = typestore_1.Log.create(__filename);
//Setup DynamoDBLocal
var DynamoDBPort = 8787;
var DynamoDBLocal = require('dynamodb-local');
var DynamoDBLocalEndpoint = "http://localhost:" + DynamoDBPort;
var Fixtures = null;
var store = null;
/**
 * Reset TypeStore and start all over
 *
 * @param syncStrategy
 * @param endpoint
 * @returns {Bluebird<Manager>}
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
    return typestore_1.Manager.reset().then(function () {
        log.info('Manager reset, now init');
    })
        .then(function () { return typestore_1.Manager.init(opts); })
        .then(function () {
        Fixtures = require('./fixtures/index');
    })
        .return(typestore_1.Manager);
}
/**
 * Global test suite
 */
describe('#store-dynamodb', function () {
    this.timeout(60000);
    before(function () {
        return DynamoDBLocal.launch(DynamoDBPort, null, ['-sharedDb']);
    });
    after(function () {
        DynamoDBLocal.stop(DynamoDBPort);
    });
    beforeEach(function () {
        return reset(typestore_1.SyncStrategy.Overwrite, DynamoDBLocalEndpoint);
    });
    /**
     * Creates a valid table definition
     */
    it('#tableDef', function () {
        typestore_1.Manager.start(Fixtures.Test1);
        var modelOpts = typestore_1.Manager.getModel(Fixtures.Test1);
        var tableDef = store.tableDefinition(modelOpts.name);
        expect(tableDef.KeySchema.length).toBe(2);
        expect(tableDef.AttributeDefinitions.length).toBe(3);
        expect(tableDef.AttributeDefinitions[0].AttributeName).toBe('id');
        expect(tableDef.AttributeDefinitions[0].AttributeType).toBe('S');
    });
    it("#sync", function () {
        return typestore_1.Manager.start(Fixtures.Test1).then(function () {
            expect(store.availableTables.length).toBeGreaterThan(0);
            expect(typestore_1.Manager.getModel(Fixtures.Test1)).not.toBeNull();
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
            return typestore_1.Manager.start().then(function () {
                test1Repo = typestore_1.Manager.getRepo(Fixtures.Test1Repo);
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

//# sourceMappingURL=DynamoDBStore.spec.js.map
