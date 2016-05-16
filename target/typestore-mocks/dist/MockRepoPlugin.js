"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var typestore_1 = require('typestore');
var MockStore_1 = require("./MockStore");

var MockRepoPlugin = function () {
    function MockRepoPlugin(store, repo) {
        _classCallCheck(this, MockRepoPlugin);

        this.store = store;
        this.repo = repo;
        this.type = typestore_1.PluginType.Repo;
        this.recordCount = 0;

        for (var _len = arguments.length, supportedModels = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            supportedModels[_key - 2] = arguments[_key];
        }

        this.supportedModels = supportedModels;
        repo.attach(this);
    }

    _createClass(MockRepoPlugin, [{
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
        key: "key",
        value: function key() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return new MockStore_1.MockKeyValue(args);
        }
    }, {
        key: "get",
        value: function get(key) {
            if (!(key instanceof MockStore_1.MockKeyValue)) {
                return null;
            }
            return Promise.resolve(new this.repo.modelClazz());
        }
    }, {
        key: "save",
        value: function save(o) {
            this.recordCount++;
            return Promise.resolve(o);
        }
    }, {
        key: "remove",
        value: function remove(key) {
            this.recordCount--;
            return Promise.resolve({});
        }
    }, {
        key: "count",
        value: function count() {
            return Promise.resolve(this.recordCount);
        }
    }]);

    return MockRepoPlugin;
}();

exports.MockRepoPlugin = MockRepoPlugin;
//# sourceMappingURL=MockRepoPlugin.js.map
