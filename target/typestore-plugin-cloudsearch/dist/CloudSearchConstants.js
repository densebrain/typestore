// Run locally with https://github.com/oisinmulvihill/nozama-cloudsearch
// NOTE: Issues with newer mongo client, updating the db interface
// with should fix OOB:
//
// try:
//  from pymongo.connection import Connection
// except ImportError as e:
//  from pymongo import MongoClient as Connection
"use strict";
//export const CloudSearchLocalEndpoint = 'http://localhost:15808/2013-08-22'
//export const CloudSearchLocalEndpoint = 'http://127.0.0.1:15808'

exports.CloudSearchLocalEndpoint = 'doc-test-local-cs-z5wcdkp6wb74brygqixjehebka.us-east-1.cloudsearch.amazonaws.com';
exports.CloudSearchFinderKey = 'cloudsearch:finder';
exports.CloudSearchDefaultTypeField = 'type';
exports.CloudSearchDefaults = {
    typeField: exports.CloudSearchDefaultTypeField,
    awsOptions: {}
};
//# sourceMappingURL=CloudSearchConstants.js.map
