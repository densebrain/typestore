///<reference path="../typings/typestore-plugin-cloudsearch"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-cloudsearchdomain"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-config.d.ts"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-sdk"/>
"use strict";
var typestore_1 = require('typestore');
var aws_sdk_1 = require('aws-sdk');
var clients = {};
function getClient(endpoint, awsOptions) {
    if (awsOptions === void 0) { awsOptions = {}; }
    var client = clients[endpoint];
    if (!client) {
        Object.assign(awsOptions, { endpoint: endpoint });
        clients[endpoint] = client = new aws_sdk_1.CloudSearchDomain(awsOptions);
    }
    return client;
}
var CloudSearchProvider = (function () {
    function CloudSearchProvider(endpoint, awsOptions) {
        if (awsOptions === void 0) { awsOptions = {}; }
        this.endpoint = endpoint;
        this.awsOptions = awsOptions;
        this.client = getClient(endpoint, awsOptions);
    }
    Object.defineProperty(CloudSearchProvider.prototype, "type", {
        get: function () {
            return typestore_1.PluginType.Indexer;
        },
        enumerable: true,
        configurable: true
    });
    CloudSearchProvider.prototype.index = function (type, options, modelType, repo) {
        var models = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            models[_i - 4] = arguments[_i];
        }
        var docs = models.map(function (model) {
            var doc = {};
            options.fields.forEach(function (field) { return doc[field] = model[field]; });
            return doc;
        });
        var data = docs.map(function (doc) {
            return Object.assign({
                id: doc[options.fields[0]]
            }, {
                fields: doc
            }, {
                type: (typestore_1.IndexAction.Remove === type) ? 'delete' : 'add'
            });
        });
        var params = { contentType: 'application/json', documents: JSON.stringify(data) };
        return typestore_1.Promise.resolve(this.client.uploadDocuments(params)
            .promise()).return(true);
    };
    /**
     * This needs to implemented a bit cleaner ;)
     *
     * Currently all args are just joined
     * with spaces and jammed into the query field
     *
     * @param modelType
     * @param opts
     * @param args
     * @returns {any}
     */
    CloudSearchProvider.prototype.search = function (modelType, opts) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return typestore_1.Promise.resolve(this.client.search({ query: args.join(' ') })
            .promise()
            .then(function (results) {
            return results.hits.hit;
        }));
    };
    return CloudSearchProvider;
}());
exports.CloudSearchProvider = CloudSearchProvider;

//# sourceMappingURL=CloudSearchProvider.js.map
