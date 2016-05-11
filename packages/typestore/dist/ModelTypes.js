"use strict";
var Errors_1 = require("./Errors");
/**
 * Simple base model implementation
 * uses reflection to determine type
 */
var DefaultModel = (function () {
    function DefaultModel() {
    }
    Object.defineProperty(DefaultModel.prototype, "clazzType", {
        get: function () {
            var type = Reflect.getOwnMetadata('design:type', this);
            if (!type)
                throw new Errors_1.NoReflectionMetataError('Unable to reflect type information');
            return type.name;
        },
        enumerable: true,
        configurable: true
    });
    return DefaultModel;
}());
exports.DefaultModel = DefaultModel;

//# sourceMappingURL=ModelTypes.js.map
