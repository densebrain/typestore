"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var typestore_1 = require("typestore");
var typestore_plugin_indexeddb_1 = require('typestore-plugin-indexeddb');
var log = typestore_1.Log.create(__filename);
/**
 * Plain Jane super simple model
 */
var IDBModel1 = function (_typestore_1$DefaultM) {
    _inherits(IDBModel1, _typestore_1$DefaultM);

    function IDBModel1() {
        _classCallCheck(this, IDBModel1);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IDBModel1).call(this));

        log.info("constructor for " + _this.constructor.name);
        return _this;
    }

    return IDBModel1;
}(typestore_1.DefaultModel);
__decorate([typestore_1.AttributeDescriptor({ name: 'id', primaryKey: true }), __metadata('design:type', String)], IDBModel1.prototype, "id", void 0);
__decorate([typestore_1.AttributeDescriptor({ name: 'createdAt' }), __metadata('design:type', Number)], IDBModel1.prototype, "createdAt", void 0);
__decorate([typestore_1.AttributeDescriptor({
    name: 'randomText',
    index: {
        name: 'RandomTextIndex'
    }
}), __metadata('design:type', String)], IDBModel1.prototype, "randomText", void 0);
IDBModel1 = __decorate([typestore_1.ModelDescriptor({ tableName: 'idb_model_1' }), __metadata('design:paramtypes', [])], IDBModel1);
exports.IDBModel1 = IDBModel1;
var IDBRepo1_1 = void 0;
var IDBRepo1 = IDBRepo1_1 = function (_typestore_1$Repo) {
    _inherits(IDBRepo1, _typestore_1$Repo);

    function IDBRepo1() {
        _classCallCheck(this, IDBRepo1);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(IDBRepo1).call(this, IDBRepo1_1, IDBModel1));
    }

    _createClass(IDBRepo1, [{
        key: "findByRandomTest",
        value: function findByRandomTest(text) {
            return null;
        }
    }]);

    return IDBRepo1;
}(typestore_1.Repo);
__decorate([typestore_plugin_indexeddb_1.IndexedDBFinderDescriptor({
    filter: function filter(o) {
        var txt = o.randomText || "";
        var q = (arguments.length <= 1 ? undefined : arguments[1]) || '';
        return txt.length > 0 && txt.toLowerCase().indexOf(q.toLowerCase()) > -1;
    }
}), typestore_1.FinderDescriptor(), __metadata('design:type', Function), __metadata('design:paramtypes', [String]), __metadata('design:returntype', Promise)], IDBRepo1.prototype, "findByRandomTest", null);
IDBRepo1 = IDBRepo1_1 = __decorate([typestore_1.RepoDescriptor(), __metadata('design:paramtypes', [])], IDBRepo1);
exports.IDBRepo1 = IDBRepo1;
//# sourceMappingURL=IndexDBTestModel.js.map
