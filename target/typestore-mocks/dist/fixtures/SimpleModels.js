"use strict";

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
var log = typestore_1.Log.create(__filename);
/**
 * Plain Jane super simple model
 */
var SimpleModel1 = function (_typestore_1$DefaultM) {
    _inherits(SimpleModel1, _typestore_1$DefaultM);

    function SimpleModel1() {
        _classCallCheck(this, SimpleModel1);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SimpleModel1).call(this));

        log.info("constructor for " + _this.constructor.name);
        return _this;
    }

    return SimpleModel1;
}(typestore_1.DefaultModel);
__decorate([typestore_1.AttributeDescriptor({ name: 'id', primaryKey: true }), __metadata('design:type', String)], SimpleModel1.prototype, "id", void 0);
__decorate([typestore_1.AttributeDescriptor({ name: 'createdAt' }), __metadata('design:type', Number)], SimpleModel1.prototype, "createdAt", void 0);
__decorate([typestore_1.AttributeDescriptor({
    name: 'randomText',
    index: {
        name: 'RandomTextIndex'
    }
}), __metadata('design:type', String)], SimpleModel1.prototype, "randomText", void 0);
SimpleModel1 = __decorate([typestore_1.ModelDescriptor({ tableName: 'simple_model_1' }), __metadata('design:paramtypes', [])], SimpleModel1);
exports.SimpleModel1 = SimpleModel1;
var SimpleModel1Repo_1 = void 0;
var SimpleModel1Repo = SimpleModel1Repo_1 = function (_typestore_1$Repo) {
    _inherits(SimpleModel1Repo, _typestore_1$Repo);

    function SimpleModel1Repo() {
        _classCallCheck(this, SimpleModel1Repo);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SimpleModel1Repo).call(this, SimpleModel1Repo_1, SimpleModel1));
    }

    return SimpleModel1Repo;
}(typestore_1.Repo);
SimpleModel1Repo = SimpleModel1Repo_1 = __decorate([typestore_1.RepoDescriptor(), __metadata('design:paramtypes', [])], SimpleModel1Repo);
exports.SimpleModel1Repo = SimpleModel1Repo;
//# sourceMappingURL=SimpleModels.js.map
