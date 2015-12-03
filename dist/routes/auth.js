'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serverJs = require('../server.js');

var _serverJs2 = _interopRequireDefault(_serverJs);

var _configJs = require('../config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _collectionUtilJs = require('../collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var _utilitiesJs = require('../utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var router = _express2['default'].Router();

router.post('/login', function (req, res) {
	var email = req.body.email;
	var pass = req.body.pass;

	var user = { "email": email, "pass": pass };
	//find user and test pass
	_serverJs2['default']._getData(['users', 'email_is_' + email]).then(function (resp) {
		//if we get a match
		if (resp.message.length) {
			var user = resp.message[0];
			//test the password
			_bcryptjs2['default'].compare(pass, user.password, function (err, valid) {
				if (valid) {
					var token = _jsonwebtoken2['default'].sign(user, _configJs2['default'].secret, {
						expiresIn: "30 days" //24r
					});

					user['token'] = token;
					delete user['pass'];
					user['authorized'] = true;
					res.render('home', { "email": user.email,
						"password": "your_password",
						"token": token
					});
				} else {
					res.status(401).json({ "success": false, "message": "password incorrect" });
				}
			});
		} else {
			res.status(404).json({ "success": false, "message": "no user found with that email" });
		}
	})['catch'](function (err) {
		res.status(500).json({ "success": false, "message": err });
	});
});

router.post('/', function (req, res) {
	var email = req.body.email || req.query.email;
	var pass = req.body.pass || req.query.pass;

	var user = { "email": email, "pass": pass };
	//find user and test pass
	_serverJs2['default']._getData(['users', 'email_is_' + email]).then(function (resp) {
		//if we get a match
		if (resp.message.length) {
			var user = resp.message[0];
			//test the password
			_bcryptjs2['default'].compare(pass, user.password, function (err, valid) {
				if (valid) {
					var token = _jsonwebtoken2['default'].sign(user, _configJs2['default'].secret, {
						expiresIn: "30d" //24r
					});

					user['token'] = token;
					delete user['pass'];
					user['authorized'] = true;
					res.json(user);
				} else {
					res.status(401).json({ success: false, message: "password incorrect" });
				}
			});
		} else {
			res.status(404).json({ success: false, message: "no user found with that email" });
		}
	})['catch'](function (err) {
		res.status(500).json(err);
	});
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=auth.js.map