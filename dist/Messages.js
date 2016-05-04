"use strict";
exports.Strings = {
    BadMessageKey: 'Bad Message Key: ?0',
    ManagerFailedToStart: 'Manager failed to start',
    ManagerErrorFn: 'Manager Function failed ?0',
    ManagerInitialized: 'Manager is already initialized',
    ManagerNotInitialized: 'Manager not initialized',
    ManagerSettled: 'Manager is settled',
    ManagerNotSettled: 'Manager not settled',
    ManagerInitComplete: 'dont forget to start when models are prepared, start triggers model prep, including table create',
    ManagerNoSyncModels: 'Create tables is disabled, nothing to prepare',
    ManagerOnlyOneKeyType: 'An attribute can only have 1 key type ?0',
    ManagerTypeStoreRequired: 'TypeStore required on options',
    PromiseUnhandledRejection: 'Unhandled promise rejection ?0',
    PromiseRejected: 'Handled rejection - just for debugging/tracing'
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
function msg(str) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!str) {
        str = exports.Strings.BadMessageKey;
        args.splice(0, 0, str);
    }
    args.forEach(function (arg, index) {
        str = str.replace(new RegExp("\\?" + index), arg);
    });
    return str;
}
exports.msg = msg;

//# sourceMappingURL=Messages.js.map
