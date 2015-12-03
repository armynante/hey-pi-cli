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

var _collectionUtilJs = require('../collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var _utilitiesJs = require('../utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var router = _express2['default'].Router();

router.get('/', function (req, res) {
	//find user and test pass
	var user = req.user;
	user['confirmed'] = true;
	var query = { 'email': user.email };

	_serverJs2['default']._update('users', query, user).then(function (resp) {
		res.render("home", { "email": user.email,
			"token": req.query.token,
			"password": "your_password"
		});
	})['catch'](function (err) {
		console.log(err);
		res.send("err");
	});
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=confirm.js.map