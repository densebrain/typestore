///<reference path="../../../typings/browser/definitions/bluebird/index.d.ts"/>

export { }

declare global {
	interface ObjectConstructor {
		assign(target: any, ...sources: any[]): any;
	}

	interface Array<T> {
		includes(element:T):boolean
		equals(any:T):boolean
	}
}


if (!Array.prototype.equals) {
	Array.prototype.equals = function(arr) {

		if (this === arr) return true;
		if (this == null || arr == null) return false;
		if (this.length != arr.length) return false;

		// If you don't care about the order of the elements inside
		// the array, you should sort both arrays here.

		for (var i = 0; i < this.length; ++i) {
			if (this[i] !== arr[i]) return false;
		}
		return true;

	}
}

/**
 * Polyfill Array.prototype.includes
 */
if (!Array.prototype.includes) {
	Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
		'use strict';
		var O = Object(this) as any;
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
			if (k < 0) {k = 0;}
		}
		var currentElement;
		while (k < len) {
			currentElement = O[k];
			if (searchElement === currentElement ||
				(searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
				return true;
			}
			k++;
		}
		return false;
	};
}
