"use strict";
var BBPromise = require('bluebird');
var Log = require('./log');
var Messages_1 = require("./Messages");
var log = Log.create(__filename);
BBPromise.config({
    cancellation: true,
    longStackTraces: true,
    warnings: true,
    monitoring: false
});
// NOTE: event name is camelCase as per node convention
process.on("unhandledRejection", function (reason, promise) {
    log.error(Messages_1.msg(Messages_1.Strings.PromiseUnhandledRejection, reason), reason, promise);
});
// NOTE: event name is camelCase as per node convention
process.on("rejectionHandled", function (promise) {
    //log.debug(msg(Strings.PromiseRejected))
});
global.Promise = BBPromise;
module.exports = BBPromise;

//# sourceMappingURL=Promise.js.map
