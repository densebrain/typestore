"use strict";
/**
 * Types of keys for dynamo
 */

(function (KeyType) {
    KeyType[KeyType["HASH"] = 0] = "HASH";
    KeyType[KeyType["RANGE"] = 1] = "RANGE";
})(exports.KeyType || (exports.KeyType = {}));
var KeyType = exports.KeyType;
/**
 * Resource status exists/notExists
 */
(function (ResourceState) {
    ResourceState[ResourceState["tableExists"] = 0] = "tableExists";
    ResourceState[ResourceState["tableNotExists"] = 1] = "tableNotExists";
})(exports.ResourceState || (exports.ResourceState = {}));
var ResourceState = exports.ResourceState;
/**
 * Current table status for monitoring
 * creation and deletion
 */
(function (TableStatus) {
    TableStatus[TableStatus["CREATING"] = 0] = "CREATING";
    TableStatus[TableStatus["UPDATING"] = 1] = "UPDATING";
    TableStatus[TableStatus["DELETING"] = 2] = "DELETING";
    TableStatus[TableStatus["ACTIVE"] = 3] = "ACTIVE";
})(exports.TableStatus || (exports.TableStatus = {}));
var TableStatus = exports.TableStatus;
exports.StatusPending = [TableStatus.CREATING, TableStatus.UPDATING];
/**
 * Finder types, in DynamoDB there are
 * two, Query & Scan
 */
(function (DynamoDBFinderType) {
    DynamoDBFinderType[DynamoDBFinderType["Query"] = 0] = "Query";
    DynamoDBFinderType[DynamoDBFinderType["Scan"] = 1] = "Scan";
})(exports.DynamoDBFinderType || (exports.DynamoDBFinderType = {}));
var DynamoDBFinderType = exports.DynamoDBFinderType;
//# sourceMappingURL=DynamoDBTypes.js.map
