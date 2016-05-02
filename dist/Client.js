"use strict";
var Log = require('./log');
var AWS = require('aws-sdk');
var log = Log.create(__filename);
var Client = (function () {
    function Client(opts) {
        this.opts = opts;
        log.debug('New dynamo client');
        if (opts.awsOptions)
            AWS.config.update(opts.awsOptions);
    }
    Object.defineProperty(Client.prototype, "serviceOptions", {
        get: function () {
            var opts = {};
            if (this.opts.dynamoEndpoint) {
                opts.endpoint = this.opts.dynamoEndpoint;
            }
            return opts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "dynamoClient", {
        get: function () {
            if (!this._dynamoClient) {
                this._dynamoClient = new AWS.DynamoDB(this.serviceOptions);
            }
            return this._dynamoClient;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "documentClient", {
        get: function () {
            if (!this._docClient) {
                this._docClient = new AWS.DynamoDB.DocumentClient(this.serviceOptions);
            }
            return this._docClient;
        },
        enumerable: true,
        configurable: true
    });
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=Client.js.map