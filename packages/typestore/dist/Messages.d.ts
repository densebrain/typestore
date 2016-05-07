export declare const Strings: {
    BadMessageKey: string;
    ManagerFailedToStart: string;
    ManagerErrorFn: string;
    ManagerInitialized: string;
    ManagerNotInitialized: string;
    ManagerSettled: string;
    ManagerNotSettled: string;
    ManagerInitComplete: string;
    ManagerNoSyncModels: string;
    ManagerOnlyOneKeyType: string;
    ManagerTypeStoreRequired: string;
    PromiseUnhandledRejection: string;
    PromiseRejected: string;
};
/**
 * Retrieve a message with placeholders
 * replaced
 *
 * @param key
 * @param args
 * @returns {any} an array of values, the index in the rest args
 *  starting at 0 maps to the string with ?0, ?1 ... ?n
 */
export declare function msg(str: any, ...args: any[]): any;
