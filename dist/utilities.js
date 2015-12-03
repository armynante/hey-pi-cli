'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var now = new Date();
var ObjectID = require("mongodb").ObjectID;

var server = _nodemailer2['default'].createTransport({
	service: 'Gmail',
	auth: {
		user: 'andrew.armenante@gmail.com',
		pass: _configJs2['default'].emailPass
	}
});

var utilities = {
	getFieldNames: function getFieldNames(collection) {
		return Object.keys(collection);
	},
	stripPath: function stripPath(path) {

		path = path.toLowerCase().split("/");
		path.splice(0, 2);
		return path;
	},
	parseQuery: function parseQuery(query) {
		/*
  Sample queries:
  	/completed_is_true
  	/user_is_lauren
  	/age_is_greater_than_21
  	/event_is_in_the_future
  	/event_was_in_the_past
  	/name_is_not_andrew
  */

		if (query.length === 0) return {};
		//allow for spaces in url to be parsed properly
		var query = query.replace(/\%20/g, ' ');

		var queryWords = query.toLowerCase().split('_');
		var fieldName = queryWords[0];
		var lastWord = queryWords[queryWords.length - 1];

		if (lastWord.match(/^(\d)*$/) !== null) {
			lastWord = parseInt(lastWord);
		} else if (lastWord.match(/^(true)$/) !== null) {
			lastWord = true;
		} else if (lastWord.match(/^(false)$/) !== null) {
			lastWord = false;
		}

		var mongoQuery = {};
		var now = new Date().toISOString();

		if (query.match(/greater_than/)) {
			mongoQuery[fieldName] = {
				$gt: parseInt(lastWord)
			};
		} else if (query.match(/less_than/)) {
			mongoQuery[fieldName] = {
				$lt: parseInt(lastWord)
			};
		} else if (query.match(/is_not/)) {
			mongoQuery[fieldName] = {
				$ne: lastWord
			};
		} else if (query.match(/is_in_future/)) {
			mongoQuery[fieldName] = {
				$gt: now
			};
		} else if (query.match(/is_in_past/)) {
			mongoQuery[fieldName] = {
				$lt: now
			};
		} else if (query.match(/is/)) {
			mongoQuery[fieldName] = lastWord;
		} else if (query.match(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)) {
			var id = new ObjectID(lastWord);
			mongoQuery["_id"] = id;
		} else {
			console.log('does not match any patterns');
			mongoQuery = null;
		}

		return mongoQuery;
	},

	sendEmail: function sendEmail(email, subject, html) {
		var welcomeEmail = {
			'html': html,
			'from': "Andrew @ Hey-PI<andrew.armenante@gmail.com>",
			'to': email,
			'subject': subject
		};

		server.sendMail(welcomeEmail, function (err, info) {
			console.log(err || info);
		});
	},

	sanitizeId: function sanitizeId(doc) {
		var id = doc._id;
		delete doc["_id"];
		doc["id"] = id.toString();
		return doc;
	},

	generateHash: function generateHash(pass) {
		var promise = new Promise(function (resolve, reject) {
			_bcryptjs2['default'].genSalt(10, function (err, salt) {
				_bcryptjs2['default'].hash(pass, salt, function (err, hash) {
					if (err) {
						reject(err);
					} else {
						resolve(hash);
					};
				});
			});
		});
		return promise;
	}
};

exports['default'] = utilities;
module.exports = exports['default'];
//# sourceMappingURL=utilities.js.map