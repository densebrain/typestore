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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBWSxHQUFHLFdBQU0sT0FDckIsQ0FBQyxDQUQyQjtBQUM1QixJQUFZLEdBQUcsV0FBTSxTQUNyQixDQUFDLENBRDZCO0FBSzlCLElBQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7QUFFbEM7SUFJQyxnQkFBb0IsSUFBb0I7UUFBcEIsU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFDdkMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBRTlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRCxzQkFBSSxrQ0FBYzthQUFsQjtZQUNDLElBQU0sSUFBSSxHQUFPLEVBQUUsQ0FBQTtZQUNuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUE7WUFFekMsQ0FBQztZQUVELE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDWixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLGdDQUFZO2FBQWhCO1lBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO1lBQzNELENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQTtRQUMxQixDQUFDOzs7T0FBQTtJQUVELHNCQUFJLGtDQUFjO2FBQWxCO1lBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtZQUN2RSxDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUE7UUFDdkIsQ0FBQzs7O09BQUE7SUFDRixhQUFDO0FBQUQsQ0FwQ0EsQUFvQ0MsSUFBQTtBQXBDWSxjQUFNLFNBb0NsQixDQUFBIiwiZmlsZSI6IkNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIExvZyBmcm9tICcuL2xvZydcbmltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJ1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0J1xuaW1wb3J0IHtJTWFuYWdlck9wdGlvbnN9IGZyb20gXCIuL1R5cGVzXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoX19maWxlbmFtZSlcblxuZXhwb3J0IGNsYXNzIENsaWVudCB7XG5cdHByaXZhdGUgX2RvY0NsaWVudDpBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnRcblx0cHJpdmF0ZSBfZHluYW1vQ2xpZW50OkFXUy5EeW5hbW9EQlxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgb3B0czpJTWFuYWdlck9wdGlvbnMpIHtcblx0XHRsb2cuZGVidWcoJ05ldyBkeW5hbW8gY2xpZW50JylcblxuXHRcdGlmIChvcHRzLmF3c09wdGlvbnMpXG5cdFx0XHRBV1MuY29uZmlnLnVwZGF0ZShvcHRzLmF3c09wdGlvbnMpXG5cdH1cblxuXHRnZXQgc2VydmljZU9wdGlvbnMoKSB7XG5cdFx0Y29uc3Qgb3B0czphbnkgPSB7fVxuXHRcdGlmICh0aGlzLm9wdHMuZHluYW1vRW5kcG9pbnQpIHtcblx0XHRcdG9wdHMuZW5kcG9pbnQgPSB0aGlzLm9wdHMuZHluYW1vRW5kcG9pbnRcblx0XHRcdFxuXHRcdH1cblxuXHRcdHJldHVybiBvcHRzXG5cdH1cblxuXHRnZXQgZHluYW1vQ2xpZW50KCkge1xuXHRcdGlmICghdGhpcy5fZHluYW1vQ2xpZW50KSB7XG5cdFx0XHR0aGlzLl9keW5hbW9DbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCKHRoaXMuc2VydmljZU9wdGlvbnMpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2R5bmFtb0NsaWVudFxuXHR9XG5cblx0Z2V0IGRvY3VtZW50Q2xpZW50KCkge1xuXHRcdGlmICghdGhpcy5fZG9jQ2xpZW50KSB7XG5cdFx0XHR0aGlzLl9kb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KHRoaXMuc2VydmljZU9wdGlvbnMpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2RvY0NsaWVudFxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9Vc2Vycy9qZ2xhbnovRGV2ZWxvcG1lbnQvZHlub3R5cGUvc3JjIn0=
