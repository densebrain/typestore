"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require('../Promise');
var Errors_1 = require("../Errors");

var FakeStore = function () {
    function FakeStore() {
        _classCallCheck(this, FakeStore);
    }

    _createClass(FakeStore, [{
        key: "init",
        value: function init(manager, opts) {
            return Promise.resolve(true);
        }
    }, {
        key: "start",
        value: function start() {
            return Promise.resolve(true);
        }
    }, {
        key: "stop",
        value: function stop() {
            return Promise.resolve(true);
        }
    }, {
        key: "syncModels",
        value: function syncModels() {
            return Errors_1.NotImplemented('syncModels');
        }
    }, {
        key: "getRepo",
        value: function getRepo(clazz) {
            return Errors_1.NotImplemented('getRepo');
        }
    }]);

    return FakeStore;
}();

exports.FakeStore = FakeStore;
//# sourceMappingURL=FakeStore.js.map
