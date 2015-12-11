"use strict";

import utilities from './utilities.js';
import collectionUtil from './collectionUtil.js';
import _ from "underscore";
import { MongoClient as Mongo }
from "mongodb";
import { ObjectID }
from "mongodb";

export class MongoClient extends Mongo {

  constructor() {
    super();
    this.db = null;
  }

  collectionNames() {
    var promise = new Promise(
      (resolve, reject) => {
        this.db.listCollections()
          .toArray((err, collections) => {

            if (err) {
              console.log(err);
              reject({
                code: 500,
                message: err
              })
            }

            resolve({
              code: 200,
              message: collections
            });
        });
      }
    )
    return promise;
  }

  _dbConnect(url) {
    var _this = this;
    Mongo.connect(url, function (err, db) {

      if (err) throw err;

      db.collection('users')
        .ensureIndex({ "email": 1 }, { unique: true });
        _this.db = db
      });
  }

  _loadCollection(name) {
    var promise = new Promise(
      (resolve, reject) => {
        this.db.collection(name, (err, collection) => {

          if (err) {
            reject(err);
          }
          else {
            resolve(collection);
          }

        });
      }
    );
    return promise;
  }

  batchOperation(collectionName, array) {
    var promise = new Promise(
      (resolve, reject) => {
        this._loadCollection(collectionName)
          .then((collection) => {

            var batch = collection.initializeUnorderedBulkOp();
            _.each(array, (operation) => {

            //convert back to ObjectIds
            if (operation.method !== 'insert') {
              operation.document._id = new ObjectID(operation.document._id);
            }

            switch (operation.method) {

              case "delete":
                batch.find(operation.document)
                  .remove();
                break;

              case "insert":
                batch.insert(operation.document);
                break;

              case "update":
                batch.find(operation.document)
                  .upsert()
                  .updateOne({
                    $set: operation.document
                  });
                break;

              case "upsert":
                batch.find(operation.document)
                  .updateOne({
                    $set: operation.document
                  });
                break;

              default:
                console.log("opperation not found");
            }
          })

          batch.execute(function (err, result) {
            if (err) {
              reject(err);
            } else {
              resolve({ "bulkresults": result.ok });
            }
          });
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        })
      }
    );
    return promise;
  }

  _save(name, obj) {
    var promise = new Promise(
      (resolve, reject) => {
        this.db.collection(name)
        .insertOne(obj, (err, resp) => {
          //check for duplicate entry
          if (err !== null) {
            reject({
              code: 400,
              message: "looks like that email is already taken"
            })
          } else {
            resolve(resp.ops[0]);
          }
        });
      }
    );
    return promise;
  }

  _get(collectionName, query) {
    var promise = new Promise(
      (resolve, reject) => {
        this.db.collection(collectionName)
          .find(query, (err, resp) => {

          //check for duplicate entry
            if (err !== null) {
              reject({ code: 500, message: "error querying " + query })
            } else {

              resp.toArray((err, docs) => {
                if (err !== null) {
                  reject(err);
                } else {
                  resolve(docs);
                }

              })

            }

          });
        }
      );
    return promise;
  }

  _delete(collectionName, query) {
    var promise = new Promise(
      (resolve, reject) => {
        this.db.collection(collectionName)
        .remove(query, {
          justOne: true
        }, (err, resp) => {

          if (err !== null) {
            reject({
              code: 500,
              message: "error deleting " + query
            })
          } else {
            resolve({
              code: 200,
              message: resp.result.n + " document deleted"
            });
          }

        });
      }
    );
    return promise;
  }


  //simple update for admin functions
  _update(name, query, obj) {
    var promise = new Promise(
      (resolve, reject) => {
        this.db.collection(name)
        .updateOne(query, { $set: obj }, (err, resp) => {

          //check for duplicate entry
          if (err !== null) {
            reject({ code: 400, message: err })
          } else {
            resolve(resp);
          }

        });
      }
    );
    return promise;
  }

  _getData(path, id, skipVal, sortVal, limitVal) {
    var promise = new Promise((resolve, reject) => {
      this._propagateQuery(path)
        .then((resolveObj) => {

          var collection = resolveObj.collection,
              mongoQuery = resolveObj.mongoQuery;

          //only load data created by the user
          mongoQuery['heypi_id'] = id;
          console.log(limitVal);
          collection.find(mongoQuery, { heypi_id: 0 })
          .sort(sortVal)
          .limit(limitVal)
          .skip(skipVal)
          .toArray((err, docs) => {
            //FIXME: What the fuck is this? I know it's important but forgot
            // the reason
            var docs = (docs);

            if (err) reject({
              "code": 500,
              "message": err
            });

            collection.count((err, count) => {
              if (err) reject({ "code": 500, "message": err });

              var responseData = {
                "code": 200,
                "message": {
                  "documents": docs,
                  "total": count
                }
              };

              resolve(responseData);
            });
          });

      }, (err) => {

        var responseData = {
          "code": 500,
          "message": err
        };

        reject(responseData);
      });
    });
    return promise;
  }

  _delData(path, id) {

    var promise = new Promise((resolve, reject) => {

      this._propagateQuery(path, id)
      .then((resolveObj) => {
        var collection = resolveObj.collection;
        var mongoQuery = resolveObj.mongoQuery;
        mongoQuery['heypi_id'] = id;
        console.log(mongoQuery);
        collection.deleteMany(mongoQuery, (err, result) => {

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
      }, (err) => {
        var responseData = {
          "code": 500,
          "message": err
        };

        reject(responseData);
      });
    });
    return promise;
  }

  _propagateQuery(path, id) {
    var pathArray = [];
    if (path.length % 2 === 1) path.push("");
    var promise = new Promise(
      (resolve, reject) => {
        for (var i = 0; i < path.length; i += 2) {
          pathArray.push([path[i], path[i + 1]]);
        }

        var chain = pathArray.reduce((previous, item, index, array) => {

          return previous.then((result) => {
            var collectionName = item[0],
                query = item[1],
                mongoQuery = utilities.parseQuery(query);

            if (mongoQuery === null) {
              reject("bad request");
            }

            //push id into query
            mongoQuery['heypi_id'] = id;
            mongoQuery = _.extend(mongoQuery, result.fkQuery);

            var promise = new Promise(
              (resolve, reject) => {
                this._loadCollection(collectionName)
                .then((collection) => {

                  if (index !== (pathArray.length - 1)) {
                    var cursor = collection.find(mongoQuery);

                    cursor.toArray((err, docs) => {

                      if (err) {
                        reject(err);
                      } else {
                        var keys = _.pluck(docs, "_id");

                        for (var i = 0; i < keys.length; i++) {
                          keys[i] = keys[i].toString();
                        };

                        var fkFieldName = collectionName + "id",
                            fkQuery = {};

                        fkQuery[fkFieldName] = { $in: keys };

                        resolve({
                          doc: docs,
                          fkQuery: fkQuery
                        });

                      }
                    })
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
        }, new Promise(
          (resolve, reject) => { //initial value given to reduce

            var result = {};
            result["fkQuery"] = {};
            resolve(result);
          }));

        chain.then((cursor) => {
          //var responseData = {"code": 200, "body": result.doc};
          resolve(cursor);
        }, (err) => {
          console.log('got into error clause after chain is finished' + err);
          //var responseData = {"code": 500, "body": err};
          reject(err);
        });
      });
    return promise;
  }

  _updateData(path, data, id) {

    var collectionName = path[0];

    var promise = new Promise(
      (resolve, reject) => {

        this._loadCollection(collectionName)

        .then((collection) => {
          return updateDataHelper(collection, id);
        })

        .then((response) => {

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
        })
        .catch((err) => {
          reject(err);
        });
      }
    );

    return promise;


    function updateDataHelper(collection, id) {
      // remove id field from obj
      var promise = new Promise(
        (resolve, reject) => {

          delete data["id"];

          if (path.length > 1) {
            var mongoQuery = utilities.parseQuery(path[1]);
            mongoQuery['heypi_id'] = id;
          }

          if (path.length == 2) {
            collectionUtil.updateOne(collection, mongoQuery, data)
              .then((result) => {

                resolve(result)
              }, (err) => {
                reject(err);
              })
          } else {
            var responseData = {
              "code": 400,
              "message": "Cannot PUT data on collections."
            };
            reject(responseData)
          }

        }
      );
      return promise;
    }
  }

  _saveData(path, data, id) {
    var _this = this,
        collectionName = path[0];

    var promise = new Promise(
      (resolve, reject) => {
        _this._loadCollection(collectionName)
        .then((collection) => {
          return saveDataHelper(collection, id);
        })

        .then((docs) => {
          docs = utilities.sanitizeId(docs);
          var responseData = {
            "code": 201,
            "message": docs
          };
          resolve(responseData);

        }, (err) => {

          var responseData = {
            "code": 500,
            "message": err.message
          };

          resolve(responseData);
        });
      }
    );

    return promise;


    function saveDataHelper(collection, id) {
      data['heypi_id'] = id;

      if (path.length > 1) {
        var mongoQuery = utilities.parseQuery(path[1]);
        if (mongoQuery !== null) {
          mongoQuery['heypi_id'] = id;
        }
      }

      if (path.length === 1) {
        var promise = new Promise(
          (resolve, reject) => {
            collection.insertOne( data, function (err, result) {

                if (err) {
                  reject(err);
                } else {
                  var data = result.ops[0]
                  delete data['heypi_id'];
                  resolve(result.ops[0]);
                }

              });
          }
        );

        return promise;

      } else if (path.length == 2) {
        //TODO: need to take this out into its own function!!!

        var promise = new Promise(
          (resolve, reject) => {
            collectionUtil.updateOne(collection, mongoQuery, data)
            .then((result) => {
              resolve(result)

            }, (err) => {
              reject(err);
            })
          }
        );

        return promise;

      } else if (path.length === 3) {
        var collectionToAddTo = path[2],
            parentID;

        var promise = new Promise(
          (resolve, reject) => {
            collectionUtil.findOne(collection, mongoQuery)

            .then((doc) => {
              parentID = doc._id.toString();
              return _this._loadCollection(collectionToAddTo);
            })

            .then((collectionToAddToObj) => {
              var obj = {},
                  keyName = collectionName + "id";

              obj[keyName] = parentID;
              data = _.extend(data, obj);

              return collectionUtil.insertOne(collectionToAddToObj, data);
            })

            .then((result) => {
              resolve(result.ops[0]);
            }, (err) => {
              reject(err);
            });
          }
        );
        return promise;
      }
    }
  }
}
