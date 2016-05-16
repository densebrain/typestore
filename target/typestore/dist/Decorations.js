"use strict";

function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}
var Log = require('./log');
var log = Log.create(__filename);
/**
 * Export all of the model decorations
 */
__export(require('./decorations/ModelDecorations'));
__export(require('./decorations/RepoDecorations'));
//# sourceMappingURL=Decorations.js.map
