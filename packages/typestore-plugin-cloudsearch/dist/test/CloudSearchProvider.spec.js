"use strict";
require('source-map-support').install();
require('expectations');
require('reflect-metadata');
var typestore_1 = require('typestore');
if (!process.env.DEBUG)
    typestore_1.Log.setLogThreshold(typestore_1.Log.LogLevel.WARN);
var sinon = require('sinon');
var uuid = require('node-uuid');
var typestore_mocks_1 = require("typestore-mocks");
var TypeStoreModelKey = typestore_1.Constants.TypeStoreModelKey, TypeStoreAttrKey = typestore_1.Constants.TypeStoreAttrKey;
var log = typestore_1.Log.create(__filename);
log.info('Starting test suite');
var store = new typestore_mocks_1.MockStore();
/**
 * Global test suite
 */
xdescribe('#plugin-cloudsearch', function () {
    var t1 = null;
    var Fixtures = require('./fixtures/index');
    function getTestModel() {
        t1 = new Fixtures.CloudSearchTestModel();
        t1.id = uuid.v4();
        t1.date = new Date();
        t1.text = 'asdfasdfadsf';
    }
    /**
     * Set it up
     */
    before(function () {
        return typestore_1.Manager
            .reset()
            .then(function () { return typestore_1.Manager.init({ store: store }); })
            .then(function () { return typestore_1.Manager.start(Fixtures.CloudSearchTestModel); })
            .return(true);
    });
    /**
     * Creates a valid table definition
     */
    describe('#indexer', function () {
        it('#add', function () {
            getTestModel();
            var repo = typestore_1.Manager.getRepo(Fixtures.CloudSearchTest1Repo);
            //const mock = sinon.mock(repo)
            var stub = sinon.stub(repo, 'save', function (o) {
                expect(o.id).toBe(t1.id);
                return this.index(typestore_1.IndexType.Add, o);
            });
            //mock.expects('save').once()
            return repo.save(t1);
        });
        it('#remove', function () {
            var repo = typestore_1.Manager.getRepo(Fixtures.CloudSearchTest1Repo);
            var stub = sinon.stub(repo, 'remove', function (o) {
                log.info('Fake remove object', o);
                expect(o.id).toBe(t1.id);
                return this.index(typestore_1.IndexType.Remove, o);
            });
            //const mock = sinon.mock(repo)
            //mock.expects('remove').once()
            return repo.remove(t1); //.then(() => mock.verify())
        });
    });
    //TODO: Add search test
});

//# sourceMappingURL=CloudSearchProvider.spec.js.map
