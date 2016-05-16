"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NotImplementedError = function (_Error) {
    _inherits(NotImplementedError, _Error);

    function NotImplementedError(name) {
        _classCallCheck(this, NotImplementedError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(NotImplementedError).call(this, name));
    }

    return NotImplementedError;
}(Error);

exports.NotImplementedError = NotImplementedError;

var IncorrectKeyTypeError = function (_Error2) {
    _inherits(IncorrectKeyTypeError, _Error2);

    function IncorrectKeyTypeError(name) {
        _classCallCheck(this, IncorrectKeyTypeError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(IncorrectKeyTypeError).call(this, name));
    }

    return IncorrectKeyTypeError;
}(Error);

exports.IncorrectKeyTypeError = IncorrectKeyTypeError;
function NotImplemented(name) {
    if (name) throw new NotImplementedError(name);
    return null;
}
exports.NotImplemented = NotImplemented;

var NoReflectionMetataError = function (_Error3) {
    _inherits(NoReflectionMetataError, _Error3);

    function NoReflectionMetataError(name) {
        _classCallCheck(this, NoReflectionMetataError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(NoReflectionMetataError).call(this, name));
    }

    return NoReflectionMetataError;
}(Error);

exports.NoReflectionMetataError = NoReflectionMetataError;
//# sourceMappingURL=Errors.js.map
