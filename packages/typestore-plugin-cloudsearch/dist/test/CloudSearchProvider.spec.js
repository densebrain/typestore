"use strict";
require('source-map-support').install();
require('expectations');
require('reflect-metadata');
var sinon = require('sinon');
var uuid = require('node-uuid');
var typestore_1 = require('typestore');
var typestore_mocks_1 = require("typestore-mocks");
var TypeStoreModelKey = typestore_1.Constants.TypeStoreModelKey, TypeStoreAttrKey = typestore_1.Constants.TypeStoreAttrKey;
var log = typestore_1.Log.create(__filename);
log.info('Starting test suite');
var store = new typestore_mocks_1.MockStore();
/**
 * Global test suite
 */
describe('#plugin-cloudsearch', function () {
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
            .init({ store: store })
            .then(function () { return typestore_1.Manager.start(Fixtures.CloudSearchTestModel); })
            .return(true);
    });
    /**
     * Creates a valid table definition
     */
    //TODO: Add indexer test
    //TODO: Remove indexer test
    describe('#indexer', function () {
        it('#add', function () {
            getTestModel();
            return typestore_1.Promise.try(function () {
                var repo = typestore_1.Manager.getRepo(Fixtures.CloudSearchTest1Repo);
                //const mock = sinon.mock(repo)
                var stub = sinon.stub(repo, 'save', function (o) {
                    log.info('Fake saving object', o);
                    expect(o.id).toBe(t1.id);
                    return this.index(typestore_1.IndexType.Add, o);
                });
                //mock.expects('save').once()
                return repo.save(t1);
            });
        });
        it('#remove', function () {
            return typestore_1.Promise.try(function () {
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
    });
});

//# sourceMappingURL=CloudSearchProvider.spec.js.map
