'use strict';

var Bluebird = require('bluebird');
Bluebird.config({
    cancellation: true,
    longStackTraces: true,
    warnings: true,
    monitoring: false
});
var Log = require('./log');
var log = Log.create(__filename);

var _require = require('./Messages');

var msg = _require.msg;
var Strings = _require.Strings;

process.on("unhandledRejection", function (reason, promise) {
    log.error(msg(Strings.PromiseUnhandledRejection, reason), reason.stack, reason, promise);
});
process.on("rejectionHandled", function (promise) {});
Promise = Bluebird;
//# sourceMappingURL=Promise.js.map
