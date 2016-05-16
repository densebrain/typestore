"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
var Decorations = require('./DynamoDBDecorations');
exports.Decorations = Decorations;
var Store = require('./DynamoDBStorePlugin');
exports.Store = Store;
__export(require('./DynamoDBConstants'));
__export(require('./DynamoDBDecorations'));
__export(require('./DynamoDBTypes'));
__export(require('./DynamoDBRepoPlugin'));
__export(require('./DynamoDBStorePlugin'));
//# sourceMappingURL=index.js.map
