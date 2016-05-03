"use strict";
require('es6-shim');
/**
 * Current logger output
 */
var loggerOutput = console;
/**
 * Use internal node console by default
 */
function log(name, level) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (!loggerOutput[level])
        level = 'info';
    var msg = "[" + name + "] [" + level + "] " + args.shift();
    loggerOutput[level].apply(loggerOutput, [msg].concat(args));
}
/**
 * Default log factory, uses console
 */
exports.DefaultLoggerFactory = {
    create: function (name) {
        /**
         * (description)
         *
         * @param level (description)
         */
        var logger = {};
        // Create levels
        var levels = ['debug', 'info', 'warn', 'error'];
        levels.forEach(function (level) {
            /**
             * (description)
             *
             * @param args (description)
             */
            logger[level] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                log.apply(void 0, [name, level].concat(args));
            };
        });
        return logger;
    }
};
/**
 * Internal core logger factory
 */
var loggerFactory = exports.DefaultLoggerFactory;
/**
 * Change the internal default logger
 *
 * @export
 * @param newLoggerFactory new logger factory
 */
function setLoggerFactory(newLoggerFactory) {
    loggerFactory = newLoggerFactory;
}
exports.setLoggerFactory = setLoggerFactory;
function setLoggerOutput(newLoggerOutput) {
    loggerOutput = newLoggerOutput;
}
exports.setLoggerOutput = setLoggerOutput;
function create(name) {
    return loggerFactory.create(name);
}
exports.create = create;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsUUFBTyxVQVFQLENBQUMsQ0FSZ0I7QUFrQ2pCOztHQUVHO0FBQ0gsSUFBSSxZQUFZLEdBQVcsT0FBTyxDQUFBO0FBRWxDOztHQUVHO0FBQ0gsYUFBYSxJQUFJLEVBQUMsS0FBSztJQUFFLGNBQU87U0FBUCxXQUFPLENBQVAsc0JBQU8sQ0FBUCxJQUFPO1FBQVAsNkJBQU87O0lBQy9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLEtBQUssR0FBRyxNQUFNLENBQUE7SUFFZixJQUFNLEdBQUcsR0FBRyxNQUFJLElBQUksV0FBTSxLQUFLLFVBQUssSUFBSSxDQUFDLEtBQUssRUFBSSxDQUFBO0lBQ2xELFlBQVksQ0FBQyxLQUFLLFFBQWxCLFlBQVksR0FBUSxHQUFHLFNBQUksSUFBSSxFQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVEOztHQUVHO0FBQ1UsNEJBQW9CLEdBQUc7SUFFbkMsTUFBTSxZQUFDLElBQVc7UUFLakI7Ozs7V0FJRztRQUNILElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtRQUVqQixnQkFBZ0I7UUFDaEIsSUFBTSxNQUFNLEdBQUcsQ0FBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUM5QyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSztZQUNwQjs7OztlQUlHO1lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHO2dCQUFDLGNBQU87cUJBQVAsV0FBTyxDQUFQLHNCQUFPLENBQVAsSUFBTztvQkFBUCw2QkFBTzs7Z0JBQ3ZCLEdBQUcsZ0JBQUMsSUFBSSxFQUFDLEtBQUssU0FBSSxJQUFJLEVBQUMsQ0FBQTtZQUN4QixDQUFDLENBQUE7UUFDRixDQUFDLENBQUMsQ0FBQTtRQUVGLE1BQU0sQ0FBQyxNQUFpQixDQUFBO0lBRXpCLENBQUM7Q0FDRCxDQUFBO0FBRUQ7O0dBRUc7QUFDSCxJQUFJLGFBQWEsR0FBa0IsNEJBQW9CLENBQUE7QUFFdkQ7Ozs7O0dBS0c7QUFDSCwwQkFBaUMsZ0JBQStCO0lBQy9ELGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQTtBQUNqQyxDQUFDO0FBRmUsd0JBQWdCLG1CQUUvQixDQUFBO0FBRUQseUJBQWdDLGVBQXVCO0lBQ3RELFlBQVksR0FBRyxlQUFlLENBQUE7QUFDL0IsQ0FBQztBQUZlLHVCQUFlLGtCQUU5QixDQUFBO0FBRUEsZ0JBQXVCLElBQVc7SUFDakMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbEMsQ0FBQztBQUZlLGNBQU0sU0FFckIsQ0FBQSIsImZpbGUiOiJsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCAnZXM2LXNoaW0nXG5cbi8qKlxuICogTG9nZ2VyIGludGVyZmFjZVxuICogXG4gKiBAZXhwb3J0XG4gKiBAaW50ZXJmYWNlIElMb2dnZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJTG9nZ2VyIHtcblx0ZGVidWc6KC4uLmFyZ3MpID0+IHZvaWRcblx0aW5mbzooLi4uYXJncykgPT4gdm9pZFxuXHR3YXJuOiguLi5hcmdzKSA9PiB2b2lkXG5cdGVycm9yOiguLi5hcmdzKSA9PiB2b2lkXG59XG5cblxuLyoqXG4gKiBDcmVhdGUgbG9nZ2VyIGluc3RhbmNlcyBmb3Igb3V0cHV0XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBpbnRlcmZhY2UgSUxvZ2dlckZhY3RvcnlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJTG9nZ2VyRmFjdG9yeSB7XG5cdC8qKlxuXHQgKiBSZXR1cm4gYSBuZXcgbG9nZ2VyIGZvciB0aGUgc3VwcGxpZWRcblx0ICogbmFtZS9jYXRlZ29yeVxuXHQgKiBcblx0ICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgKGRlc2NyaXB0aW9uKVxuXHQgKiBAcmV0dXJucyB7SUxvZ2dlcn0gKGRlc2NyaXB0aW9uKVxuXHQgKi9cblx0Y3JlYXRlKG5hbWU6c3RyaW5nKTpJTG9nZ2VyXG59XG5cblxuLyoqXG4gKiBDdXJyZW50IGxvZ2dlciBvdXRwdXRcbiAqL1xubGV0IGxvZ2dlck91dHB1dDpJTG9nZ2VyID0gY29uc29sZVxuXG4vKipcbiAqIFVzZSBpbnRlcm5hbCBub2RlIGNvbnNvbGUgYnkgZGVmYXVsdFxuICovXG5mdW5jdGlvbiBsb2cobmFtZSxsZXZlbCwgLi4uYXJncykge1xuXHRpZiAoIWxvZ2dlck91dHB1dFtsZXZlbF0pXG5cdFx0bGV2ZWwgPSAnaW5mbydcblx0XG5cdGNvbnN0IG1zZyA9IGBbJHtuYW1lfV0gWyR7bGV2ZWx9XSAke2FyZ3Muc2hpZnQoKX1gXHRcblx0bG9nZ2VyT3V0cHV0W2xldmVsXShtc2csLi4uYXJncyk7XG59XG5cbi8qKlxuICogRGVmYXVsdCBsb2cgZmFjdG9yeSwgdXNlcyBjb25zb2xlXG4gKi9cbmV4cG9ydCBjb25zdCBEZWZhdWx0TG9nZ2VyRmFjdG9yeSA9IHtcblx0XG5cdGNyZWF0ZShuYW1lOnN0cmluZyk6SUxvZ2dlciB7XG5cdFx0XG5cdFx0XG5cdFx0XG5cdFx0XG5cdFx0LyoqXG5cdFx0ICogKGRlc2NyaXB0aW9uKVxuXHRcdCAqIFxuXHRcdCAqIEBwYXJhbSBsZXZlbCAoZGVzY3JpcHRpb24pXG5cdFx0ICovXG5cdFx0Y29uc3QgbG9nZ2VyID0ge31cblx0XHRcblx0XHQvLyBDcmVhdGUgbGV2ZWxzXG5cdFx0Y29uc3QgbGV2ZWxzID0gWydkZWJ1ZycsJ2luZm8nLCd3YXJuJywnZXJyb3InXVxuXHRcdGxldmVscy5mb3JFYWNoKChsZXZlbCkgPT4ge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiAoZGVzY3JpcHRpb24pXG5cdFx0XHQgKiBcblx0XHRcdCAqIEBwYXJhbSBhcmdzIChkZXNjcmlwdGlvbilcblx0XHRcdCAqL1xuXHRcdFx0bG9nZ2VyW2xldmVsXSA9ICguLi5hcmdzKSA9PiB7XG5cdFx0XHRcdGxvZyhuYW1lLGxldmVsLC4uLmFyZ3MpXG5cdFx0XHR9XG5cdFx0fSlcblx0XHRcblx0XHRyZXR1cm4gbG9nZ2VyIGFzIElMb2dnZXJcblx0XHRcblx0fVxufVxuXG4vKipcbiAqIEludGVybmFsIGNvcmUgbG9nZ2VyIGZhY3RvcnlcbiAqL1xubGV0IGxvZ2dlckZhY3Rvcnk6SUxvZ2dlckZhY3RvcnkgPSBEZWZhdWx0TG9nZ2VyRmFjdG9yeVxuXG4vKipcbiAqIENoYW5nZSB0aGUgaW50ZXJuYWwgZGVmYXVsdCBsb2dnZXJcbiAqIFxuICogQGV4cG9ydFxuICogQHBhcmFtIG5ld0xvZ2dlckZhY3RvcnkgbmV3IGxvZ2dlciBmYWN0b3J5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRMb2dnZXJGYWN0b3J5KG5ld0xvZ2dlckZhY3Rvcnk6SUxvZ2dlckZhY3RvcnkpIHtcblx0bG9nZ2VyRmFjdG9yeSA9IG5ld0xvZ2dlckZhY3Rvcnlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldExvZ2dlck91dHB1dChuZXdMb2dnZXJPdXRwdXQ6SUxvZ2dlcikge1xuXHRsb2dnZXJPdXRwdXQgPSBuZXdMb2dnZXJPdXRwdXRcbn1cblxuIGV4cG9ydCBmdW5jdGlvbiBjcmVhdGUobmFtZTpzdHJpbmcpIHtcblx0IHJldHVybiBsb2dnZXJGYWN0b3J5LmNyZWF0ZShuYW1lKVxuIH0iXSwic291cmNlUm9vdCI6Ii9Vc2Vycy9qZ2xhbnovRGV2ZWxvcG1lbnQvZHlub3R5cGUvc3JjIn0=
