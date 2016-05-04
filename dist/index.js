"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
require('es6-shim');
var log_1 = require('./log');
exports.setLoggerFactory = log_1.setLoggerFactory;
exports.setLoggerOutput = log_1.setLoggerOutput;
__export(require('./ModelDecorations'));
__export(require('./Manager'));

//# sourceMappingURL=index.js.map
