"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
require('reflect-metadata');
var Errors_1 = require('./Errors');
__export(require('./PluginTypes'));
/**
 * Simple base model implementation
 * uses reflection to determine type
 */

var DefaultModel = function () {
    function DefaultModel() {
        _classCallCheck(this, DefaultModel);
    }

    _createClass(DefaultModel, [{
        key: 'clazzType',
        get: function get() {
            var type = Reflect.getOwnMetadata('design:type', this);
            if (!type) throw new Errors_1.NoReflectionMetataError('Unable to reflect type information');
            return type.name;
        }
    }]);

    return DefaultModel;
}();

exports.DefaultModel = DefaultModel;
/**
 * Sync strategy for updating models in the store
 */
(function (SyncStrategy) {
    SyncStrategy[SyncStrategy["Overwrite"] = 0] = "Overwrite";
    SyncStrategy[SyncStrategy["Update"] = 1] = "Update";
    SyncStrategy[SyncStrategy["None"] = 2] = "None";
})(exports.SyncStrategy || (exports.SyncStrategy = {}));
var SyncStrategy = exports.SyncStrategy;
var SyncStrategy;
(function (SyncStrategy) {
    SyncStrategy.toString = function (strategy) {
        return SyncStrategy[strategy];
    };
})(SyncStrategy = exports.SyncStrategy || (exports.SyncStrategy = {}));
/**
 * Coordinator options default implementation
 */

var CoordinatorOptions = function CoordinatorOptions() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, CoordinatorOptions);

    Object.assign(this, opts, CoordinatorOptions.Defaults);
};
/**
 * Default manager options
 *
 * @type {{autoRegisterModules: boolean, syncStrategy: SyncStrategy, immutable: boolean}}
 */


CoordinatorOptions.Defaults = {
    autoRegisterModules: true,
    syncStrategy: SyncStrategy.None,
    immutable: false
};
exports.CoordinatorOptions = CoordinatorOptions;
//# sourceMappingURL=Types.js.map
