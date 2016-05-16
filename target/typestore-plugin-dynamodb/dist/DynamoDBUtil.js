"use strict";

var DynamoDBTypes_1 = require("./DynamoDBTypes");
var _ = require('lodash');
function typeToDynamoType(type) {
    var typeName = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    return type === String || typeName === 'String' ? 'S' : type === Number || typeName === 'Number' ? 'N' : type === Array || typeName === 'Array' ? 'L' : 'M'; //object
}
exports.typeToDynamoType = typeToDynamoType;
function tableNameParam(TableName) {
    return { TableName: TableName };
}
exports.tableNameParam = tableNameParam;
function isTableStatusIn(status) {
    if (_.isString(status)) {
        status = DynamoDBTypes_1.TableStatus[status];
    }

    for (var _len = arguments.length, statuses = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        statuses[_key - 1] = arguments[_key];
    }

    return _.includes(statuses, status);
}
exports.isTableStatusIn = isTableStatusIn;
//# sourceMappingURL=DynamoDBUtil.js.map
