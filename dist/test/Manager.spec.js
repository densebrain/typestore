"use strict";
require('source-map-support').install();
require('reflect-metadata');
require('expectations');
var Dyno = require('../index');
var Log = require('../log');
var Constants_1 = require('../Constants');
var Manager = Dyno.Manager;
var log = Log.create(__filename);
log.info('Starting test suite');
var Fixtures = null;
function reset(createTables, endpoint) {
    // Init dynamo type
    // using local
    var opts = {
        dynamoEndpoint: endpoint,
        createTables: createTables,
        prefix: "test_" + process.env.USER + "_"
    };
    if (!endpoint)
        delete opts['endpoint'];
    Manager.init(opts);
    delete require['./fixtures/index'];
    Fixtures = require('./fixtures/index');
}
describe('dynotype', function () {
    describe('Decorators', function () {
        beforeEach(function () {
            reset(false, Constants_1.LocalEndpoint);
        });
        it('decorates a new model', function () {
            var test1 = new Fixtures.Test1();
            var constructorFn = test1.constructor.prototype;
            expect(constructorFn).toBe(Fixtures.Test1.prototype);
            var attrData = Reflect.getOwnMetadata(Constants_1.DynoAttrKey, constructorFn), modelData = Reflect.getOwnMetadata(Constants_1.DynoModelKey, constructorFn);
            expect(attrData.length).toEqual(2);
            expect(modelData.attrs.length).toEqual(2);
        });
    });
    describe('Client connects and works', function () {
        beforeEach(function () {
            reset(true, Constants_1.LocalEndpoint);
        });
        it("Can create a table for a model", function (done) {
            done();
        });
    });
});
//# sourceMappingURL=Manager.spec.js.map