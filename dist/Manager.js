/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
"use strict";
require('reflect-metadata');
var _ = require('lodash');
var assert = require('assert');
var Log = require('./log');
var Client_1 = require('./Client');
var Constants_1 = require('./Constants');
var log = Log.create(__filename);
var Manager;
(function (Manager) {
    var models = {};
    /**
     * Default options
     */
    var options = {
        createTables: true
    };
    var ready = false;
    /**
     * Ref to aws client
     */
    var client;
    /**
     * Set the manager options
     */
    function init(newOptions) {
        ready = true;
        _.assign(options, newOptions);
        client = new Client_1.Client(options);
    }
    Manager.init = init;
    function checkReady() {
        assert(ready, 'The system must be initialized before registering models, etc');
    }
    /**
     * Register a model with the system
     *
     * @param clazzName
     * @param constructor
     * @param opts
     */
    function registerModel(clazzName, constructor, opts) {
        checkReady();
        // Retrieve its attributes first
        opts.attrs = Reflect.getOwnMetadata(Constants_1.DynoAttrKey, constructor.prototype);
        // Define the metadata for the model
        Reflect.defineMetadata(Constants_1.DynoModelKey, opts, constructor.prototype);
        models[clazzName] = _.assign({}, opts, {
            clazz: constructor
        });
    }
    Manager.registerModel = registerModel;
    function registerAttribute(target, propertyKey, opts) {
        checkReady();
        var attrType = Reflect.getMetadata('design:type', target, propertyKey);
        _.defaults(opts, {
            type: attrType,
            typeName: _.get(attrType, 'name', 'unknown type'),
            key: propertyKey
        });
        log.info("Decorating " + propertyKey, opts);
        var modelAttrs = Reflect.getMetadata(Constants_1.DynoAttrKey, target) || [];
        modelAttrs.push(opts);
        Reflect.defineMetadata(Constants_1.DynoAttrKey, modelAttrs, target);
    }
    Manager.registerAttribute = registerAttribute;
})(Manager = exports.Manager || (exports.Manager = {}));
/**
 * Management service
 */
// export const Service = {
// 	/**
// 	 * Save a persistable model
// 	 */
// 	save<T extends PersistableModel>(model:T):T {
// 		return null
// 	},
// 	get<T,K>(key:K):T {
// 		return null
// 	}
// }

//# sourceMappingURL=data:application/json;charset=utf8;base64,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RztBQUNILDJCQUEyQjtBQUUzQixPQUFPO0FBQ1AsK0JBQStCO0FBQy9CLE9BQU87QUFDUCxpREFBaUQ7QUFFakQsZ0JBQWdCO0FBQ2hCLE1BQU07QUFHTix1QkFBdUI7QUFFdkIsZ0JBQWdCO0FBQ2hCLEtBQUs7QUFDTCxJQUFJIiwiZmlsZSI6Ik1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vbm9kZV9tb2R1bGVzL3JlZmxlY3QtbWV0YWRhdGEvcmVmbGVjdC1tZXRhZGF0YS5kLnRzXCIgLz5cblxuaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJ1xuaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCdcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnXG5cbmltcG9ydCAqIGFzIExvZyBmcm9tICcuL2xvZydcbmltcG9ydCB7Q2xpZW50fSBmcm9tICcuL0NsaWVudCdcbmltcG9ydCB7RHlub01vZGVsS2V5LER5bm9BdHRyS2V5fSBmcm9tICcuL0NvbnN0YW50cydcbmltcG9ydCB7SU1vZGVsT3B0aW9ucyxJQXR0cmlidXRlT3B0aW9ucyxJTWFuYWdlck9wdGlvbnN9IGZyb20gJy4vVHlwZXMnXG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoX19maWxlbmFtZSlcblxuXG5cblxuZXhwb3J0IG5hbWVzcGFjZSBNYW5hZ2VyIHtcblxuXG5cblxuXHRjb25zdCBtb2RlbHM6YW55ID0ge31cblxuXHQvKipcblx0ICogRGVmYXVsdCBvcHRpb25zXG5cdCAqL1xuXHRjb25zdCBvcHRpb25zOklNYW5hZ2VyT3B0aW9ucyA9IHtcblx0XHRjcmVhdGVUYWJsZXM6IHRydWVcblx0fVxuXG5cdGxldCByZWFkeSA9IGZhbHNlXG5cblx0LyoqXG5cdCAqIFJlZiB0byBhd3MgY2xpZW50XG5cdCAqL1xuXHRsZXQgY2xpZW50OkNsaWVudFxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIG1hbmFnZXIgb3B0aW9uc1xuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGluaXQobmV3T3B0aW9uczpJTWFuYWdlck9wdGlvbnMpIHtcblx0XHRyZWFkeSA9IHRydWVcblxuXHRcdF8uYXNzaWduKG9wdGlvbnMsbmV3T3B0aW9ucylcblxuXHRcdGNsaWVudCA9IG5ldyBDbGllbnQob3B0aW9ucylcblx0fVxuXG5cblx0ZnVuY3Rpb24gY2hlY2tSZWFkeSgpIHtcblx0XHRhc3NlcnQocmVhZHksJ1RoZSBzeXN0ZW0gbXVzdCBiZSBpbml0aWFsaXplZCBiZWZvcmUgcmVnaXN0ZXJpbmcgbW9kZWxzLCBldGMnKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGEgbW9kZWwgd2l0aCB0aGUgc3lzdGVtXG5cdCAqXG5cdCAqIEBwYXJhbSBjbGF6ek5hbWVcblx0ICogQHBhcmFtIGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSBvcHRzXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJNb2RlbChjbGF6ek5hbWU6c3RyaW5nLGNvbnN0cnVjdG9yOkZ1bmN0aW9uLG9wdHM6SU1vZGVsT3B0aW9ucykge1xuXHRcdGNoZWNrUmVhZHkoKVxuXG5cdFx0Ly8gUmV0cmlldmUgaXRzIGF0dHJpYnV0ZXMgZmlyc3Rcblx0XHRvcHRzLmF0dHJzID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YShEeW5vQXR0cktleSwgY29uc3RydWN0b3IucHJvdG90eXBlKSBhcyBJQXR0cmlidXRlT3B0aW9uc1tdXG5cblx0XHQvLyBEZWZpbmUgdGhlIG1ldGFkYXRhIGZvciB0aGUgbW9kZWxcblx0XHRSZWZsZWN0LmRlZmluZU1ldGFkYXRhKER5bm9Nb2RlbEtleSxvcHRzLGNvbnN0cnVjdG9yLnByb3RvdHlwZSlcblxuXG5cdFx0bW9kZWxzW2NsYXp6TmFtZV0gPSBfLmFzc2lnbih7fSxvcHRzLHtcblx0XHRcdGNsYXp6OmNvbnN0cnVjdG9yXG5cdFx0fSlcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckF0dHJpYnV0ZSh0YXJnZXQ6YW55LHByb3BlcnR5S2V5OnN0cmluZyxvcHRzOklBdHRyaWJ1dGVPcHRpb25zKSB7XG5cdFx0Y2hlY2tSZWFkeSgpXG5cblx0XHRjb25zdCBhdHRyVHlwZSA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoJ2Rlc2lnbjp0eXBlJyx0YXJnZXQscHJvcGVydHlLZXkpXG5cdFx0Xy5kZWZhdWx0cyhvcHRzLHtcblx0XHRcdHR5cGU6YXR0clR5cGUsXG5cdFx0XHR0eXBlTmFtZTogXy5nZXQoYXR0clR5cGUsJ25hbWUnLCd1bmtub3duIHR5cGUnKSxcblx0XHRcdGtleTpwcm9wZXJ0eUtleVxuXHRcdH0pO1xuXG5cdFx0bG9nLmluZm8oYERlY29yYXRpbmcgJHtwcm9wZXJ0eUtleX1gLG9wdHMpXG5cdFx0Y29uc3QgbW9kZWxBdHRycyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoRHlub0F0dHJLZXksdGFyZ2V0KSB8fCBbXVxuXHRcdG1vZGVsQXR0cnMucHVzaChvcHRzKVxuXHRcdFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoRHlub0F0dHJLZXksbW9kZWxBdHRycyx0YXJnZXQpXG5cdH1cbn1cblxuXG5cbi8qKlxuICogTWFuYWdlbWVudCBzZXJ2aWNlXG4gKi9cbi8vIGV4cG9ydCBjb25zdCBTZXJ2aWNlID0ge1xuXG4vLyBcdC8qKlxuLy8gXHQgKiBTYXZlIGEgcGVyc2lzdGFibGUgbW9kZWxcbi8vIFx0ICovXG4vLyBcdHNhdmU8VCBleHRlbmRzIFBlcnNpc3RhYmxlTW9kZWw+KG1vZGVsOlQpOlQge1xuXG4vLyBcdFx0cmV0dXJuIG51bGxcbi8vIFx0fSxcblxuXG4vLyBcdGdldDxULEs+KGtleTpLKTpUIHtcblxuLy8gXHRcdHJldHVybiBudWxsXG4vLyBcdH1cbi8vIH1cbiJdLCJzb3VyY2VSb290IjoiL1VzZXJzL2pnbGFuei9EZXZlbG9wbWVudC9keW5vdHlwZS9zcmMifQ==
