"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
        if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
    if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
require('reflect-metadata');
var Log = require('../../log');
var Decorations_1 = require("../../Decorations");
var log = Log.create(__filename);
var ModelTest1 = function ModelTest1() {
    _classCallCheck(this, ModelTest1);

    log.info("constructor for " + this.constructor.name);
};
__decorate([Decorations_1.AttributeDescriptor({ name: 'id', primaryKey: true }), __metadata('design:type', String)], ModelTest1.prototype, "id", void 0);
__decorate([Decorations_1.AttributeDescriptor({ name: 'createdAt', secondaryKey: true }), __metadata('design:type', Number)], ModelTest1.prototype, "createdAt", void 0);
__decorate([Decorations_1.AttributeDescriptor({
    name: 'randomText',
    index: {
        name: 'RandomTextIndex'
    }
}), __metadata('design:type', String)], ModelTest1.prototype, "randomText", void 0);
ModelTest1 = __decorate([Decorations_1.ModelDescriptor({ tableName: 'testTable_manager1' }), __metadata('design:paramtypes', [])], ModelTest1);
exports.ModelTest1 = ModelTest1;
//# sourceMappingURL=ModelTest1.js.map
