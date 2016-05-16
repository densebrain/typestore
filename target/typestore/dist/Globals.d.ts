/// <reference path="../../../typings/browser/definitions/bluebird/index.d.ts" />
export {  };
declare global  {
    interface ObjectConstructor {
        assign(target: any, ...sources: any[]): any;
    }
    interface Array<T> {
        includes(element: T): boolean;
    }
    interface ArrayConstructor {
        arraysEqual(arr1: any[], arr2: any[]): boolean;
    }
}
export {};
