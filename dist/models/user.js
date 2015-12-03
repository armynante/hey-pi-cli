'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _serverJs = require('../server.js');

var _serverJs2 = _interopRequireDefault(_serverJs);

var _configJs = require('../config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _utilitiesJs = require('../utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var now = new Date();

var User = (function () {
  function User(email) {
    _classCallCheck(this, User);

    this.email = email;
    this.password = '';
    this.confirmed = false;
    this.numCols = 0;
    this.numDocs = 0;
    this.isGuest = false;
    this.usersId = null;
    this.writes = 0;
    this.reads = 0;
    this.createdOn = now;
  }

  _createClass(User, [{
    key: 'save',
    value: function save() {
      var _this = this;

      var promise = new Promise(function (resolve, reject) {
        _serverJs2['default']._save('users', _this).then(function (savedUser) {
          //if the user is created assign a token
          var token = _jsonwebtoken2['default'].sign(savedUser, _configJs2['default'].secret, {
            expiresIn: "20d" //24r
          });
          // remover clear text pass
          delete savedUser['pass'];
          savedUser['token'] = token;
          resolve({ code: 201, message: savedUser });
        })['catch'](function (err) {
          reject({ code: 500, message: err });
        });
      });
      return promise;
    }
  }, {
    key: 'setPassword',
    value: function setPassword(pass) {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        _utilitiesJs2['default'].generateHash(pass).then(function (hash) {
          _this2.password = hash;
          resolve(hash);
        })['catch'](function (err) {
          reject({ code: 500, message: err });
        });
      });
      return promise;
    }
  }]);

  return User;
})();

exports.User = User;
//# sourceMappingURL=user.js.map