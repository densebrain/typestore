import 'es6-shim';
/**
 * Logger interface
 *
 * @export
 * @interface ILogger
 */
export interface ILogger {
    debug: (...args) => void;
    info: (...args) => void;
    warn: (...args) => void;
    error: (...args) => void;
}
/**
 * Create logger instances for output
 *
 * @export
 * @interface ILoggerFactory
 */
export interface ILoggerFactory {
    /**
     * Return a new logger for the supplied
     * name/category
     *
     * @param {string} name (description)
     * @returns {ILogger} (description)
     */
    create(name: string): ILogger;
}
/**
 * Default log factory, uses console
 */
export declare const DefaultLoggerFactory: {
    create(name: string): ILogger;
};
/**
 * Change the internal default logger
 *
 * @export
 * @param newLoggerFactory new logger factory
 */
export declare function setLoggerFactory(newLoggerFactory: ILoggerFactory): void;
export declare function setLoggerOutput(newLoggerOutput: ILogger): void;
export declare function create(name: string): ILogger;
