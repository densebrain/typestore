

declare global {
	interface ObjectConstructor {
		assign<T>(target:T, ...sources: any[]):T & any;
		isEqual(o1:any,o2:any):boolean
	}

	interface Array<T> {
		includes(element:T):boolean

	}

	interface ArrayConstructor {
		isEqual(arr1:any[],arr2:any[],ignoreOrder?:boolean):boolean
	}

	var __filename:string
}

/**
 * Add Object.isEqual to static type
 */
if (!Object.isEqual) {
	Object.isEqual = (o1:any,o2:any):boolean => {
		return o1 === o2 ||
			(o1.isEqual && o2.isEqual && o1.isEqual(o2))
	}
}

/**
 * Add Array.isEqual
 */
if (!Array.isEqual) {

	Array.isEqual = function(arr1,arr2,ignoreOrder = false) {

		if (arr1 === arr2) return true;
		if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
		if (arr1.length != arr2.length) return false;


		// If you don't care about the order of the elements inside
		// the array, you should sort both arrays here.
		if (!ignoreOrder) {
			for (var i = 0; i < arr1.length; ++i) {
				if (arr1[i] !== arr2[i]) return false;
			}
		} else {
			for (let item1 of arr1) {
				if (!arr2.find(item2 => Object.isEqual(item1,item2)))
					return false
			}
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


export {

}
