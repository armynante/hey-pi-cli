import express from 'express'
import Mongo from '../server.js';
import {User} from '../models/user.js';
import config from '../config.js';
import utilities from '../utilities.js';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { ObjectID } from "mongodb";

var router = express.Router();


router.post('/',(req,res) => {
  var guest = new User(req.body.email);
  guest.isGuest = true;
  guest.usersId = req.user._id;
  guest.setPassword(req.body.pass).then(()=> {
    return guest.save();
  })
  .then((resp) => {
    var html = '';
    var emailSubject = 'Welocome to Hey-P.I';
    if (req.body.htmlEmailMessage !== null && req.body.htmlEmailMessage !== '') {
      html = req.body.htmlEmailMessage;
    }
    if (req.body.emailSubject !== null && req.body.emailSubject !== '') {
      emailSubject = req.body.emailSubject;
    }
    html += "<br><p>please click on the link to confirm account<p></br><a href='http://hey-pi.com/confirm?token="+ resp.message.token + "'>confirm account...</a>";
    utilities.sendEmail(guest.email, emailSubject, html);
    res.status(resp.code).json(resp.message);
  })
	.catch((err) => {
    console.log(err);
		res.status(err.code).json(err);
	})
});

router.post('/authorize',(req,res) => {
	var email = req.body.email || req.query.email;
	var pass = req.body.pass || req.query.pass;

	var user = { "email": email, "pass": pass};
	//find user and test pass
	Mongo._getData(['users','email_is_' + email]).then((resp) => {
		//if we get a match
		if (resp.message.length) {
			var user = resp.message[0];
			//test the password
			bcrypt.compare(pass, user.password, (err,valid) => {
				if(valid) {
					var token = jwt.sign(user, config.secret, {
						expiresIn: "30d" //24r
					});

					user['token'] = token;
					delete user['pass'];
					user['authorized'] = true;
					res.json(user);

				} else {
					res.status(401).json({success: false, message:"password incorrect"});
				}

			});
		} else {
			res.status(404).json({success: false, message:"no user found with that email"});
		}
	})
	.catch((err) => {
    console.log(err);
		res.status(500).json(err)
	});
});

router.get('/', (req, res) => {
 	Mongo._get('users',{'usersId' : req.user._id}).then((resp) => {
    console.log(resp);
      req.user.reads++;
      Mongo._update('users',{'_id':req.user._id}, req.user);
			res.status(200).json(resp);
		})
		.catch((err) => {
      console.log(err);
			res.json(err);
		});
	});

router.get('/:userId', (req, res) => {
  try {
    var id = new ObjectID(req.params.userId);
  } catch (e) {
    res.status(500).json({message:"Error parsing id. Please check too see if the id is valid."});
  }

 	Mongo._get('users',{'usersId' : req.user._id, "_id":id}).then((resp) => {
      req.user.reads++;
      Mongo._update('users',{'_id':req.user._id}, req.user);
			res.status(200).json(resp);
		})
		.catch((err) => {
      console.log(err);
			res.json(err);
		});
	});

router.put('/:userId', (req, res) => {

  try {

    var id = new ObjectID(req.params.userId);

    if (req.body._id !== undefined) {
      req.body._id = new ObjectID(req.body._id);
    }
    if (req.body.usersId !== undefined) {
      req.body.usersId = new ObjectID(req.body.usersId);
    }

  } catch (e) {
    res.status(500).json({message:"Error parsing id. Please check too see if the id is valid."});
  }

 	Mongo._update('users',{"_id":id},req.body).then((resp) => {
      req.user.writes++;
      Mongo._update('users',{'_id':req.user._id}, req.user);
			res.status(200).json({"success":true,"message":"guest record updated"});
		})
		.catch((err) => {
      res.status(err.message.code).json({message: err.message.message});
		});
	});

  //DELETE
  router.delete("/", (req,resp) => {
    res.status(405).json({success:false, message: "batch DELETE operations not allowed on guests collection"});
  })


  //DELETE ONE
  router.delete("/:userId", (req,res) => {
    try {
      var id = new ObjectID(req.params.userId);
    } catch (e) {
      res.status(500).json({message:"Error parsing id. Please check too see if the id is valid."});
    }

    //check to see if user owns the record
    Mongo._get('users',{"usersId" : req.user._id, "_id": id } ).then((resp) => {
      if (resp[0] !== undefined) {
        Mongo._delete('users',{'_id': id}).then((resp) => {
          res.status(resp.code).json(resp.message);
        });
      } else {
			  res.status(400).json({success:false, message:"No record fount to delete with that id"});
      }
		})
		.catch((err) => {
      console.log(err);
			res.json(err);
		});
  })



export default router
