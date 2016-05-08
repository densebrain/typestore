"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NotImplementedError = (function (_super) {
    __extends(NotImplementedError, _super);
    function NotImplementedError(name) {
        _super.call(this, name);
    }
    return NotImplementedError;
}(Error));
exports.NotImplementedError = NotImplementedError;
var IncorrectKeyTypeError = (function (_super) {
    __extends(IncorrectKeyTypeError, _super);
    function IncorrectKeyTypeError(name) {
        _super.call(this, name);
    }
    return IncorrectKeyTypeError;
}(Error));
exports.IncorrectKeyTypeError = IncorrectKeyTypeError;
function NotImplemented(name) {
    if (name)
        throw new NotImplementedError(name);
    return null;
}
exports.NotImplemented = NotImplemented;
var NoReflectionMetataError = (function (_super) {
    __extends(NoReflectionMetataError, _super);
    function NoReflectionMetataError(name) {
        _super.call(this, name);
    }
    return NoReflectionMetataError;
}(Error));
exports.NoReflectionMetataError = NoReflectionMetataError;

//# sourceMappingURL=Errors.js.map
