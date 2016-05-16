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
var ModelDecorations_1 = require("../decorations/ModelDecorations");
var Constants_1 = require("../Constants");
var MetadataManager_1 = require("../MetadataManager");
var DecorationTest = function DecorationTest() {
    _classCallCheck(this, DecorationTest);
};
__decorate([ModelDecorations_1.AttributeDescriptor(), __metadata('design:type', String)], DecorationTest.prototype, "myString", void 0);
DecorationTest = __decorate([ModelDecorations_1.ModelDescriptor(), __metadata('design:paramtypes', [])], DecorationTest);
describe('#typestore', function () {
    describe('#model-decorations', function () {
        before(function () {
            new DecorationTest();
        });
        it("#hasModelOptions", function () {
            var md = MetadataManager_1.getMetadata(Constants_1.TypeStoreModelKey, DecorationTest);
            expect(md.clazz).toBe(DecorationTest);
            expect(md.clazzName).toBe('DecorationTest');
            expect(md.attrs.length).toBe(1);
        });
        it("#hasAttrOptions", function () {
            var md = MetadataManager_1.getMetadata(Constants_1.TypeStoreAttrKey, DecorationTest, 'myString');
            expect(md.name).toBe('myString');
            expect(md.type).toBe(String);
        });
    });
});
//# sourceMappingURL=ModelDecorations.spec.js.map
