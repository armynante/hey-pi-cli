'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serverJs = require('../server.js');

var _serverJs2 = _interopRequireDefault(_serverJs);

var _modelsUserJs = require('../models/user.js');

var _configJs = require('../config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilitiesJs = require('../utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var router = _express2['default'].Router();

router.get('/homepage/:email/:pass', function (req, res) {
  var user = new _modelsUserJs.User(req.params.email);
  user.setPassword(req.params.pass).then(function () {
    return user.save();
  }).then(function (resp) {
    res.render('home', { "email": req.params.email,
      "token": resp.message.User.token,
      "password": "your_password",
      "id": resp.message.User._id
    });
  })['catch'](function (err) {
    res.status(err.code).json(err.message);
  });
});

router.post('/', function (req, res) {
  var user = new _modelsUserJs.User(req.body.email);
  user.setPassword(req.body.pass).then(function () {
    return user.save();
  }).then(function (resp) {
    console.log(resp);
    var html = "<p>please click on the link to confirm account<p></br><a href='http://hey-pi.com/confirm?token=" + resp.message.token + "'>confirm account...</a>";
    _utilitiesJs2['default'].sendEmail(resp.message.email, 'Welcome to Hey-p.i! Please click to confirm', html);
    res.status(resp.code).json(resp.message);
  })['catch'](function (err) {
    console.log(err);
    res.status(err.code).json(err.message);
  });
});

router.post('/:email/:pass', function (req, res) {
  var user = { email: req.params.email, pass: req.params.pass };
  user.setPassword(req.body.pass).then(function () {
    return user.save();
  }).then(function (resp) {
    res.status(resp.code).json(resp.message);
  })['catch'](function (err) {
    res.status(err.code).json(err.message);
  });
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=register.js.map