"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AWS = require('aws-sdk');
require('reflect-metadata');
var typestore_1 = require('typestore');
var CloudSearchProvider_1 = require("../../CloudSearchProvider");
var CloudSearchConstants_1 = require("../../CloudSearchConstants");
var log = typestore_1.Log.create(__filename);
var sharedIniCreds = new AWS.SharedIniFileCredentials({ profile: 'default' });
//const csClient = new AWS.CloudSearch()
// AWS.config.update({region: 'us-east-1',accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// 	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY})
// module.exports = new AWS.CloudSearchDomain({
// 	endpoint: 'doc-test-local-cs-z5wcdkp6wb74brygqixjehebka.us-east-1.cloudsearch.amazonaws.com',
// 	region: 'us-east-1',
//
// })
exports.cloudSearchProvider = new CloudSearchProvider_1.CloudSearchProvider(CloudSearchConstants_1.CloudSearchLocalEndpoint, {
    region: 'us-east-1',
    credentials: sharedIniCreds
});
var CloudSearchTestModel = (function (_super) {
    __extends(CloudSearchTestModel, _super);
    function CloudSearchTestModel() {
        _super.call(this);
        log.info("constructor for " + this.constructor.name);
    }
    __decorate([
        typestore_1.Decorations.AttributeDescriptor({ name: 'id', hashKey: true }), 
        __metadata('design:type', String)
    ], CloudSearchTestModel.prototype, "id", void 0);
    __decorate([
        typestore_1.Decorations.AttributeDescriptor({}), 
        __metadata('design:type', Number)
    ], CloudSearchTestModel.prototype, "date", void 0);
    __decorate([
        typestore_1.Decorations.AttributeDescriptor({}), 
        __metadata('design:type', String)
    ], CloudSearchTestModel.prototype, "text", void 0);
    CloudSearchTestModel = __decorate([
        typestore_1.Decorations.ModelDescriptor({ tableName: 'testTable1' }), 
        __metadata('design:paramtypes', [])
    ], CloudSearchTestModel);
    return CloudSearchTestModel;
}(typestore_1.Types.DefaultModel));
exports.CloudSearchTestModel = CloudSearchTestModel;
var CloudSearchTest1Repo = (function (_super) {
    __extends(CloudSearchTest1Repo, _super);
    function CloudSearchTest1Repo() {
        _super.call(this, CloudSearchTest1Repo, CloudSearchTestModel);
    }
    /**
     * Create a simple external finder
     *
     * @param text
     * @returns {null}
     */
    CloudSearchTest1Repo.prototype.findByText = function (text) {
        return null;
    };
    __decorate([
        typestore_1.Decorations.FinderDescriptor({
            searchOptions: {
                resultType: Object,
                resultKeyMapper: typestore_1.DefaultKeyMapper('id'),
                provider: exports.cloudSearchProvider
            }
        }), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String]), 
        __metadata('design:returntype', (typeof (_a = typeof typestore_1.Promise !== 'undefined' && typestore_1.Promise) === 'function' && _a) || Object)
    ], CloudSearchTest1Repo.prototype, "findByText", null);
    CloudSearchTest1Repo = __decorate([
        typestore_1.Decorations.RepoDescriptor({
            indexers: [{
                    indexer: exports.cloudSearchProvider,
                    fields: ['id', 'text', 'date']
                }]
        }), 
        __metadata('design:paramtypes', [])
    ], CloudSearchTest1Repo);
    return CloudSearchTest1Repo;
    var _a;
}(typestore_1.Repo));
exports.CloudSearchTest1Repo = CloudSearchTest1Repo;

//# sourceMappingURL=CloudSearchTestModel.js.map
