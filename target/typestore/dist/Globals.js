///<reference path="../../../typings/browser/definitions/bluebird/index.d.ts"/>
"use strict";

if (!Array.arraysEqual) {
    Array.arraysEqual = function (arr1, arr2) {
        if (arr1 === arr2) return true;
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
        if (arr1.length != arr2.length) return false;
        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        for (var i = 0; i < arr1.length; ++i) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    };
}
/**
 * Polyfill Array.prototype.includes
 */
if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement /*, fromIndex*/) {
        'use strict';

        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {
                k = 0;
            }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
                return true;
            }
            k++;
        }
        return false;
    };
}
//# sourceMappingURL=Globals.js.map
