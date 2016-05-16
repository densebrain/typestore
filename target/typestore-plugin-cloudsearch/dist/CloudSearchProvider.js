"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
///<reference path="../typings/typestore-plugin-cloudsearch"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-cloudsearchdomain"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-config.d.ts"/>
///<reference path="../node_modules/aws-sdk-typescript/output/typings/aws-sdk"/>
var _ = require('lodash');
var typestore_1 = require('typestore');
var aws_sdk_1 = require('aws-sdk');
var CloudSearchConstants_1 = require("./CloudSearchConstants");
var log = typestore_1.Log.create(__filename);
var clients = {};
function getClient(endpoint) {
    var awsOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var client = clients[endpoint];
    if (!client) {
        Object.assign(awsOptions, { endpoint: endpoint });
        clients[endpoint] = client = new aws_sdk_1.CloudSearchDomain(awsOptions);
    }
    return client;
}

var CloudSearchProvider = function () {
    /**
     * Create a new AWS CloudSearch Provider
     *
     * @param options
     */

    function CloudSearchProvider(options) {
        _classCallCheck(this, CloudSearchProvider);

        this.options = options;
        this.type = typestore_1.PluginType.Indexer;

        for (var _len = arguments.length, supportedModels = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            supportedModels[_key - 1] = arguments[_key];
        }

        this.supportedModels = supportedModels;
        _.defaultsDeep(options, CloudSearchConstants_1.CloudSearchDefaults);
        Object.assign(this, options);
        this.client = getClient(this.endpoint, this.awsOptions);
    }

    _createClass(CloudSearchProvider, [{
        key: 'handle',
        value: function handle(eventType) {
            switch (eventType) {
                case typestore_1.PluginEventType.RepoInit:
                    var repo = arguments.length <= 1 ? undefined : arguments[1];
                    if (this.supportedModels.length === 0 || this.supportedModels.includes(repo.modelClazz)) {
                        repo.attach(this);
                        return repo;
                    }
            }
            return false;
        }
    }, {
        key: 'init',
        value: function init(coordinator, opts) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt('return', this.coordinator = coordinator);

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
        /**
         * Called to start the plugin
         *
         * @returns {any}
         */

    }, {
        key: 'start',
        value: function start() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt('return', this.coordinator);

                            case 1:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
        /**
         * Called to stop the plugin
         *
         * @returns {any}
         */

    }, {
        key: 'stop',
        value: function stop() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                return _context3.abrupt('return', this.coordinator);

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
        /**
         * Indexing action pushing documents to CloudSearch
         *
         * @param type
         * @param options
         * @param modelType
         * @param repo
         * @param models
         * @returns {boolean}
         */

    }, {
        key: 'index',
        value: function index(type, options, modelType, repo) {
            for (var _len2 = arguments.length, models = Array(_len2 > 4 ? _len2 - 4 : 0), _key2 = 4; _key2 < _len2; _key2++) {
                models[_key2 - 4] = arguments[_key2];
            }

            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                var _this = this;

                var docs, data, params;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                // Destructure all the import fields into 'docs'
                                docs = models.map(function (model) {
                                    return options.fields.reduce(function (doc, field) {
                                        doc[field] = model[field];
                                        return doc;
                                    }, _defineProperty({}, _this.typeField, modelType.name));
                                });
                                // Now convert to cloudsearch data

                                data = docs.map(function (doc) {
                                    return Object.assign({
                                        id: doc[options.fields[0]]
                                    }, {
                                        fields: doc
                                    }, {
                                        type: typestore_1.IndexAction.Remove === type ? 'delete' : 'add'
                                    });
                                });
                                // Create request params

                                params = { contentType: 'application/json', documents: JSON.stringify(data) };
                                _context4.next = 5;
                                return this.client.uploadDocuments(params).promise();

                            case 5:
                                return _context4.abrupt('return', true);

                            case 6:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
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

    }, {
        key: 'search',
        value: function search(modelType, opts) {
            for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
                args[_key3 - 2] = arguments[_key3];
            }

            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                var params, results;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                params = {
                                    query: '(and ' + this.typeField + ':\'' + modelType.name + '\' (term \'' + encodeURIComponent(args.join(' ')) + '\'))',
                                    queryParser: 'structured'
                                };

                                log.info('Querying with params', params);
                                _context5.next = 4;
                                return this.client.search(params).promise();

                            case 4:
                                results = _context5.sent;
                                return _context5.abrupt('return', results.hits.hit);

                            case 6:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }]);

    return CloudSearchProvider;
}();

exports.CloudSearchProvider = CloudSearchProvider;
//# sourceMappingURL=CloudSearchProvider.js.map
