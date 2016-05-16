"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var index_1 = require('../../index');

var NullStore = function () {
    function NullStore() {
        _classCallCheck(this, NullStore);

        this.type = index_1.PluginType.Store;

        for (var _len = arguments.length, supportedModels = Array(_len), _key = 0; _key < _len; _key++) {
            supportedModels[_key] = arguments[_key];
        }

        this.supportedModels = supportedModels;
    }

    _createClass(NullStore, [{
        key: "handle",
        value: function handle(eventType) {
            return false;
        }
    }, {
        key: "init",
        value: function init(coordinator, opts) {
            this.coordinator = coordinator;
            return Promise.resolve(coordinator);
        }
    }, {
        key: "start",
        value: function start() {
            return Promise.resolve(this.coordinator);
        }
    }, {
        key: "stop",
        value: function stop() {
            return Promise.resolve(this.coordinator);
        }
    }, {
        key: "syncModels",
        value: function syncModels() {
            return Promise.resolve(this.coordinator);
        }
    }, {
        key: "initRepo",
        value: function initRepo(repo) {
            return repo;
        }
    }]);

    return NullStore;
}();

exports.NullStore = NullStore;
//# sourceMappingURL=NullStore.js.map
