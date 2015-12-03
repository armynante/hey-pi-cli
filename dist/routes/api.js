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

var router = _express2['default'].Router();

//assigns the users users or "guests" an api key and password.
//also deals with lost passwords
router.use('/guests', _guestsJs2['default']);

router.get('/collections', function (req, res) {
	_serverJs2['default'].collectionNames().then(function (resp) {
		res.status(resp.code).json(resp.message);
	})['catch'](function (err) {
		console.log(err);
		res.json("error pulling collection names");
	});
});

router.get('/*', function (req, res) {
	if (req.strip_path[0] !== undefined) {
		_serverJs2['default']._getData(req.strip_path, req.user._id).then(function (resp) {
			req.user.reads++;
			_serverJs2['default']._update('users', { '_id': req.user._id }, req.user);
			res.status(resp.code).json(resp.message);
		})['catch'](function (err) {
			res.json("error querying path " + req.strip_path);
		});
	} else {
		res.status(404).json("Hi!");
	}
});

router.post('/*', function (req, res) {
	_serverJs2['default']._saveData(req.strip_path, req.body, req.user._id).then(function (resp) {
		req.user.writes++;
		req.user.numDocs++;
		_serverJs2['default']._update('users', { '_id': req.user._id }, req.user);
		res.json(resp.message);
	})['catch'](function (err) {
		res.status(err.code).json("error saving data");
	});
});

router.put('/*', function (req, res) {
	_serverJs2['default']._updateData(req.strip_path, req.body, req.user._id).then(function (resp) {
		req.user.writes++;
		_serverJs2['default']._update('users', { '_id': new _mongodb.ObjectID(req.user._id) }, req.user);
		res.status(resp.code).json(resp.message);
	})['catch'](function (err) {
		res.status(500).json(err.message);
	});
});

router['delete']('/*', function (req, res) {
	_serverJs2['default']._delData(req.strip_path, req.user._id).then(function (resp) {
		debugger;
		req.user.writes += resp.docDelta;
		req.user.numDocs -= resp.docDelta;
		_serverJs2['default']._update('users', { '_id': new _mongodb.ObjectID(req.user._id) }, req.user);
		res.status(resp.code).json(resp.message);
	})['catch'](function (err) {
		res.status(err.code).json("error updating data");
	});
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=api.js.map