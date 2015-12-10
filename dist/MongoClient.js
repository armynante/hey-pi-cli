"use strict";

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilitiesJs = require('./utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _collectionUtilJs = require('./collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _mongodb = require("mongodb");

var MongoClient = (function (_Mongo) {
  _inherits(MongoClient, _Mongo);

  function MongoClient() {
    _classCallCheck(this, MongoClient);

    _get(Object.getPrototypeOf(MongoClient.prototype), 'constructor', this).call(this);
    this.db = null;
  }

  _createClass(MongoClient, [{
    key: 'collectionNames',
    value: function collectionNames() {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        _this2.db.listCollections().toArray(function (err, collections) {
          if (err) {
            console.log(err);
            reject({ code: 500, message: err });
          }
          resolve({ code: 200, message: collections });
        });
      });
      return promise;
    }
  }, {
    key: '_dbConnect',
    value: function _dbConnect(url) {
      var _this = this;
      _mongodb.MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        db.collection('users').ensureIndex({ "email": 1 }, { unique: true });
        _this.db = db;
      });
    }
  }, {
    key: '_loadCollection',
    value: function _loadCollection(name) {
      var _this3 = this;

      var promise = new Promise(function (resolve, reject) {
        _this3.db.collection(name, function (err, collection) {
          if (err) reject(err);else resolve(collection);
        });
      });
      return promise;
    }
  }, {
    key: 'batchOperation',
    value: function batchOperation(collectionName, array) {
      var _this4 = this;

      var promise = new Promise(function (resolve, reject) {
        _this4._loadCollection(collectionName).then(function (collection) {
          var batch = collection.initializeUnorderedBulkOp();
          _underscore2['default'].each(array, function (operation) {
            //convert back to ObjectIds
            if (operation.method !== 'insert') {
              operation.document._id = new _mongodb.ObjectID(operation.document._id);
            }
            switch (operation.method) {
              case "delete":
                batch.find(operation.document).remove();
                break;
              case "insert":
                console.log("INSERT");
                batch.insert(operation.document);
                break;
              case "update":
                batch.find(operation.document).upsert().updateOne({ $set: operation.document });
                break;
              case "upsert":
                batch.find(operation.document).updateOne({ $set: operation.document });
                break;
              default:
                console.log("opperation not found");
            }
          });
          batch.execute(function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve({ "bulkresults": result.ok });
            }
          });
        })['catch'](function (err) {
          console.log(err);
          reject(err);
        });
      });
      return promise;
    }
  }, {
    key: '_save',
    value: function _save(name, obj) {
      var _this5 = this;

      var promise = new Promise(function (resolve, reject) {
        _this5.db.collection(name).insertOne(obj, function (err, resp) {
          //check for duplicate entry
          if (err !== null) {
            reject({ code: 400, message: "looks like that email is already taken" });
          } else {
            resolve(resp.ops[0]);
          }
        });
      });
      return promise;
    }
  }, {
    key: '_get',
    value: function _get(collectionName, query) {
      var _this6 = this;

      var promise = new Promise(function (resolve, reject) {
        _this6.db.collection(collectionName).find(query, function (err, resp) {
          //check for duplicate entry
          if (err !== null) {
            reject({ code: 500, message: "error querying " + query });
          } else {
            resp.toArray(function (err, docs) {
              if (err !== null) {
                reject(err);
              } else {
                resolve(docs);
              }
            });
          }
        });
      });
      return promise;
    }
  }, {
    key: '_delete',
    value: function _delete(collectionName, query) {
      var _this7 = this;

      var promise = new Promise(function (resolve, reject) {
        _this7.db.collection(collectionName).remove(query, { justOne: true }, function (err, resp) {

          if (err !== null) {
            reject({ code: 500, message: "error deleting " + query });
          } else {
            resolve({ code: 200, message: resp.result.n + " document deleted" });
          }
        });
      });
      return promise;
    }

    //simple update for admin functions
  }, {
    key: '_update',
    value: function _update(name, query, obj) {
      var _this8 = this;

      var promise = new Promise(function (resolve, reject) {
        _this8.db.collection(name).updateOne(query, { $set: obj }, function (err, resp) {
          //check for duplicate entry
          if (err !== null) {
            reject({ code: 400, message: err });
          } else {
            resolve(resp);
          }
        });
      });
      return promise;
    }
  }, {
    key: '_getData',
    value: function _getData(path, id, skipVal, sortVal, limitVal) {
      var _this9 = this;

      var promise = new Promise(function (resolve, reject) {

        _this9._propagateQuery(path).then(function (resolveObj) {
          var collection = resolveObj.collection;
          var mongoQuery = resolveObj.mongoQuery;
          //only load data created by the user
          mongoQuery['heypi_id'] = id;
          console.log(limitVal);
          collection.find(mongoQuery, { heypi_id: 0 }).sort(sortVal).limit(limitVal).skip(skipVal).toArray(function (err, docs) {
            //FIXME: What the fuck is this? I know its neccisary for something but forgot
            var docs = docs;

            if (err) reject({
              "code": 500,
              "message": err
            });

            collection.count(function (err, count) {
              if (err) reject({
                "code": 500,
                "message": err
              });

              var responseData = {
                "code": 200,
                "message": { "documents": docs, "total": count }
              };

              resolve(responseData);
            });
          });
        }, function (err) {
          var responseData = {
            "code": 500,
            "message": err
          };

          reject(responseData);
        });
      });
      return promise;
    }
  }, {
    key: '_delData',
    value: function _delData(path, id) {
      var _this10 = this;

      var promise = new Promise(function (resolve, reject) {

        _this10._propagateQuery(path, id).then(function (resolveObj) {
          var collection = resolveObj.collection;
          var mongoQuery = resolveObj.mongoQuery;
          mongoQuery['heypi_id'] = id;
          console.log(mongoQuery);
          collection.deleteMany(mongoQuery, function (err, result) {

            if (err) reject({
              "code": 500,
              "message": err
            });

            var numDocsDeleted = result.deletedCount;
            var responseData = {
              "code": 200,
              "message": "Deleteted " + numDocsDeleted + " documents.",
              "docDelta": numDocsDeleted
            };

            resolve(responseData);
          });
        }, function (err) {
          var responseData = {
            "code": 500,
            "message": err
          };

          reject(responseData);
        });
      });
      return promise;
    }
  }, {
    key: '_propagateQuery',
    value: function _propagateQuery(path, id) {
      var _this11 = this;

      var pathArray = [];
      if (path.length % 2 === 1) path.push("");
      var promise = new Promise(function (resolve, reject) {
        for (var i = 0; i < path.length; i += 2) {
          pathArray.push([path[i], path[i + 1]]);
        }

        var chain = pathArray.reduce(function (previous, item, index, array) {

          return previous.then(function (result) {
            var collectionName = item[0];
            var query = item[1];

            var mongoQuery = _utilitiesJs2['default'].parseQuery(query);

            if (mongoQuery === null) {
              reject("bad request");
            }

            //push id into query
            mongoQuery['heypi_id'] = id;

            mongoQuery = _underscore2['default'].extend(mongoQuery, result.fkQuery);

            var promise = new Promise(function (resolve, reject) {
              _this11._loadCollection(collectionName).then(function (collection) {
                if (index !== pathArray.length - 1) {
                  var cursor = collection.find(mongoQuery);

                  cursor.toArray(function (err, docs) {
                    if (err) {
                      reject(err);
                    } else {
                      var keys = _underscore2['default'].pluck(docs, "_id");

                      for (var i = 0; i < keys.length; i++) {
                        keys[i] = keys[i].toString();
                      };

                      var fkFieldName = collectionName + "id";
                      var fkQuery = {};
                      fkQuery[fkFieldName] = {
                        $in: keys
                      };
                      resolve({
                        doc: docs,
                        fkQuery: fkQuery
                      });
                    }
                  });
                } else {
                  var resolveObj = {};
                  resolveObj["collection"] = collection;
                  resolveObj["mongoQuery"] = mongoQuery;
                  resolve(resolveObj);
                }
              });
            });
            return promise;
          });
        }, new Promise(function (resolve, reject) {
          //initial value given to reduce
          var result = {};
          result["fkQuery"] = {};
          resolve(result);
        }));

        chain.then(function (cursor) {
          //var responseData = {"code": 200, "body": result.doc};
          resolve(cursor);
        }, function (err) {
          console.log('got into error clause after chain is finished' + err);
          //var responseData = {"code": 500, "body": err};
          reject(err);
        });
      });
      return promise;
    }
  }, {
    key: '_updateData',
    value: function _updateData(path, data, id) {
      var _this12 = this;

      var collectionName = path[0];

      var promise = new Promise(function (resolve, reject) {

        _this12._loadCollection(collectionName).then(function (collection) {
          return updateDataHelper(collection, id);
        }).then(function (response) {

          var modifiedCount = response.result.modifiedCount;

          if (modifiedCount > 0) {

            var responseData = {
              "code": 200,
              "message": "Updated " + modifiedCount + " documents"
            };
          } else {

            var responseData = {
              "code": 204,
              "message": "No documents updated :("
            };
          }
          resolve(responseData);
        })['catch'](function (err) {
          reject(err);
        });
      });

      return promise;

      function updateDataHelper(collection, id) {
        // remove id field from obj

        var promise = new Promise(function (resolve, reject) {

          delete data["id"];

          if (path.length > 1) {
            var mongoQuery = _utilitiesJs2['default'].parseQuery(path[1]);
            mongoQuery['heypi_id'] = id;
          }

          if (path.length == 2) {
            _collectionUtilJs2['default'].updateOne(collection, mongoQuery, data).then(function (result) {

              resolve(result);
            }, function (err) {
              reject(err);
            });
          } else {
            var responseData = {
              "code": 400,
              "message": "Cannot PUT data on collections."
            };
            reject(responseData);
          }
        });
        return promise;
      }
    }
  }, {
    key: '_saveData',
    value: function _saveData(path, data, id) {
      var _this = this;
      var collectionName = path[0];

      var promise = new Promise(function (resolve, reject) {
        _this._loadCollection(collectionName).then(function (collection) {
          return saveDataHelper(collection, id);
        }).then(function (docs) {
          docs = _utilitiesJs2['default'].sanitizeId(docs);
          var responseData = {
            "code": 201,
            "message": docs
          };
          resolve(responseData);
        }, function (err) {

          var responseData = {
            "code": 500,
            "message": err.message
          };
          console.log("response data is: " + responseData);
          resolve(responseData);
        });
      });

      return promise;

      function saveDataHelper(collection, id) {
        console.log(data);
        data['heypi_id'] = id;

        if (path.length > 1) {
          var mongoQuery = _utilitiesJs2['default'].parseQuery(path[1]);
          if (mongoQuery !== null) {
            mongoQuery['heypi_id'] = id;
          }
        }

        if (path.length === 1) {
          var promise = new Promise(function (resolve, reject) {
            collection.insertOne(data, function (err, result) {
              if (err) {
                reject(err);
              } else {
                var data = result.ops[0];
                delete data['heypi_id'];
                resolve(result.ops[0]);
              }
            });
          });

          return promise;
        } else if (path.length == 2) {
          //TODO: need to take this out into its own function!!!

          var promise = new Promise(function (resolve, reject) {
            _collectionUtilJs2['default'].updateOne(collection, mongoQuery, data).then(function (result) {
              resolve(result);
            }, function (err) {
              reject(err);
            });
          });

          return promise;
        } else if (path.length === 3) {
          var collectionToAddTo = path[2];
          var parentID;

          var promise = new Promise(function (resolve, reject) {
            _collectionUtilJs2['default'].findOne(collection, mongoQuery).then(function (doc) {
              parentID = doc._id.toString();
              return _this._loadCollection(collectionToAddTo);
            }).then(function (collectionToAddToObj) {
              var obj = {};
              var keyName = collectionName + "id";
              obj[keyName] = parentID;
              data = _underscore2['default'].extend(data, obj);
              return _collectionUtilJs2['default'].insertOne(collectionToAddToObj, data);
            }).then(function (result) {
              resolve(result.ops[0]);
            }, function (err) {
              reject(err);
            });
          });
          return promise;
        }
      }
    }
  }]);

  return MongoClient;
})(_mongodb.MongoClient);

exports.MongoClient = MongoClient;
//# sourceMappingURL=MongoClient.js.map