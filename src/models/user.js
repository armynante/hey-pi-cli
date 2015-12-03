import Mongo from '../server.js';
import config from '../config.js';
import bcrypt from 'bcryptjs';
import utilities from '../utilities.js';
import jwt from 'jsonwebtoken';
let now = new Date();

export class User {

  constructor(email) {
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



  save() {
    var promise = new Promise(
      (resolve, reject) => {
        Mongo._save('users',this).then((savedUser) => {
          //if the user is created assign a token
          var token = jwt.sign(savedUser, config.secret, {
            expiresIn: "20d" //24r
          });
          // remover clear text pass
          delete savedUser['pass'];
          savedUser['token'] = token;
          resolve({code: 201, message: savedUser});
        })
        .catch((err) => {
          reject({code:500,message:err});
        });
      }
    )
    return promise;
  }

  setPassword(pass) {
    var promise = new Promise(
      (resolve, reject) => {
        utilities.generateHash(pass).then((hash) => {
          this.password = hash;
          resolve(hash);
        })
        .catch((err) => {
          reject({code:500, message: err});
        })
      }
    )
    return promise;
  }
}
