"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var typestore_1 = require('typestore');
var MockRepoPlugin_1 = require("./MockRepoPlugin");
/**
 * Mock key value, gives whatever it gets
 */

var MockKeyValue = function MockKeyValue() {
    _classCallCheck(this, MockKeyValue);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    this.args = args;
};

exports.MockKeyValue = MockKeyValue;
/**
 * Mock store for testing, spying, etc
 */

var MockStore = function () {
    function MockStore() {
        _classCallCheck(this, MockStore);

        this.type = typestore_1.PluginType.Store;
        this.repoPlugins = [];

        for (var _len2 = arguments.length, supportedModels = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            supportedModels[_key2] = arguments[_key2];
        }

        this.supportedModels = supportedModels;
    }

    _createClass(MockStore, [{
        key: "handle",
        value: function handle(eventType) {
            switch (eventType) {
                case typestore_1.PluginEventType.RepoInit:
                    typestore_1.repoAttachIfSupported(arguments.length <= 1 ? undefined : arguments[1], this);
                    var repo = arguments.length <= 1 ? undefined : arguments[1];
                    return this.initRepo(repo);
            }
            return false;
        }
    }, {
        key: "init",
        value: function init(coordinator, opts) {
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
            this.repoPlugins.push(new MockRepoPlugin_1.MockRepoPlugin(this, repo));
            return repo;
        }
    }]);

    return MockStore;
}();

exports.MockStore = MockStore;
//# sourceMappingURL=MockStore.js.map
