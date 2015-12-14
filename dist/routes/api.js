'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serverJs = require('../server.js');

var _serverJs2 = _interopRequireDefault(_serverJs);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _mongodb = require("mongodb");

var _guestsJs = require('./guests.js');

var _guestsJs2 = _interopRequireDefault(_guestsJs);

var _utilitiesJs = require('../utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var router = _express2['default'].Router();

//assigns the users users or "guests" an api key and password.
//also deals with lost passwords
router.use('/guests', _guestsJs2['default']);

router.get('/collections', function (req, res) {
	_serverJs2['default'].collectionNames().then(function (resp) {
		//remove system collections like 'schemas' & 'system.indexes'
		var collections = [];

		_underscore2['default'].each(resp.message, function (doc) {

			if (doc.name !== 'schemas' && doc.name !== 'system.indexes') {
				collections.push(doc);
			}
		});

		res.status(resp.code).json(collections);
	})['catch'](function (err) {
		console.log(err);
		res.json("error pulling collection names");
	});
});

router.post('/batch/:collection', function (req, res) {
	_underscore2['default'].map(req.body.operations, function (obj) {
		if (obj.method === 'insert') {
			obj.document['heypi_id'] = req.user._id;
		}
	});

	_serverJs2['default'].batchOperation(req.params.collection, req.body.operations).then(function (resp) {
		res.json(resp);
	})['catch'](function (err) {
		console.log(err);
		res.json(err);
	});
});

router.post('/batch_insert/:collection', function (req, res) {
	var docs = [];

	_underscore2['default'].each(req.body, function (obj) {
		obj['heypi_id'] = req.user._id;
		docs.push({ method: "insert", document: obj });
	});
	_serverJs2['default'].batchOperation(req.params.collection, docs).then(function (resp) {
		res.json(resp);
	})['catch'](function (err) {
		res.json(err);
	});
});

router.get('/*', function (req, res) {

	//structure the query
	if (req.query.sort !== undefined && req.query.sort !== null) {
		req.query.sort = _utilitiesJs2['default'].sortParam(req.query.sort);
	} else {
		req.query.sort = {};
	}

	if (req.query.skip === undefined || req.query.skip === null) req.query.skip = 0;
	if (req.query.limit === undefined || req.query.limit === null) req.query.limit = 50;

	req.query.limit = parseInt(req.query.limit);
	req.query.skip = parseInt(req.query.skip);

	if (req.strip_path[0] !== undefined) {
		_serverJs2['default'].getData(req.strip_path, req.user._id, req.query.skip, req.query.sort, req.query.limit).then(function (resp) {
			req.user.reads++;
			_serverJs2['default'].update('users', { '_id': req.user._id }, req.user);
			res.status(resp.code).json(resp.message);
		})['catch'](function (err) {
			res.json("error querying path " + req.strip_path);
		});
	} else {
		res.status(404).json("Hi!");
	}
});

router.post('/*', function (req, res) {
	_serverJs2['default'].saveData(req.strip_path, req.body, req.user._id).then(function (resp) {

		req.user.writes++;
		req.user.numDocs++;

		_serverJs2['default'].update("users", { "_id": req.user._id }, req.user);
		var loc = "/" + req.strip_path + "/" + resp.message.id;

		res.status(201).location(loc).json(resp.message);
	})['catch'](function (err) {
		res.status(err.code).json("error saving data");
	});
});

router.put('/*', function (req, res) {
	_serverJs2['default'].updateData(req.strip_path, req.body, req.user._id).then(function (resp) {
		req.user.writes++;
		_serverJs2['default'].update('users', { '_id': new _mongodb.ObjectID(req.user._id) }, req.user);
		res.status(resp.code).json(resp.message);
	})['catch'](function (err) {
		res.status(500).json(err.message);
	});
});

router['delete']('/*', function (req, res) {
	_serverJs2['default'].delData(req.strip_path, req.user._id).then(function (resp) {
		req.user.writes += resp.docDelta;
		req.user.numDocs -= resp.docDelta;
		_serverJs2['default'].update('users', { '_id': new _mongodb.ObjectID(req.user._id) }, req.user);
		res.status(resp.code).json(resp.message);
	})['catch'](function (err) {
		res.status(err.code).json("error updating data");
	});
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=api.js.map