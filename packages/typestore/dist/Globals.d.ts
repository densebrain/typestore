export {  };
declare global  {
    interface ObjectConstructor {
        assign(target: any, ...sources: any[]): any;
    }
    interface Array<T> {
        includes(element: T): boolean;
    }
}
export {};
