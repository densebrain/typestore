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
require('reflect-metadata');
var Log = require('../../log');
var Repo_1 = require("../../Repo");
var Decorations_1 = require("../../Decorations");
var DynamoDBDecorators_1 = require("../../DynamoDBDecorators");
// import {IRepo,IRepoOptions} from "../../Types";
// import {RepoDescriptor, FinderDescriptor} from "../../Decorations";
// import {DefaultRepo} from "../../DefaultRepo";
var log = Log.create(__filename);
var Test1 = (function () {
    function Test1() {
        log.info("constructor for " + this.constructor.name);
    }
    __decorate([
        Decorations_1.AttributeDescriptor({ name: 'id', hashKey: true }), 
        __metadata('design:type', String)
    ], Test1.prototype, "id", void 0);
    __decorate([
        Decorations_1.AttributeDescriptor({ name: 'createdAt', rangeKey: true }), 
        __metadata('design:type', Number)
    ], Test1.prototype, "createdAt", void 0);
    __decorate([
        Decorations_1.AttributeDescriptor({
            name: 'randomText',
            index: {
                name: 'RandomTextIndex'
            }
        }), 
        __metadata('design:type', String)
    ], Test1.prototype, "randomText", void 0);
    Test1 = __decorate([
        Decorations_1.ModelDescriptor({ tableName: 'testTable1' }), 
        __metadata('design:paramtypes', [])
    ], Test1);
    return Test1;
}());
exports.Test1 = Test1;
var Test1Repo = (function (_super) {
    __extends(Test1Repo, _super);
    function Test1Repo() {
        _super.call(this, Test1);
    }
    Test1Repo.prototype.findByRandomText = function (text) {
        return null;
    };
    __decorate([
        DynamoDBDecorators_1.DynamoDBFinderDescriptor({
            queryExpression: "randomText contains :randomText",
            // values could be ['randomText'] with the same effect
            values: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                return {
                    randomText: args[0]
                };
            }
        }),
        Decorations_1.FinderDescriptor(), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String]), 
        __metadata('design:returntype', Array)
    ], Test1Repo.prototype, "findByRandomText", null);
    Test1Repo = __decorate([
        Decorations_1.RepoDescriptor(), 
        __metadata('design:paramtypes', [])
    ], Test1Repo);
    return Test1Repo;
}(Repo_1.Repo));
exports.Test1Repo = Test1Repo;

//# sourceMappingURL=Test1.js.map
