import express from 'express'
import Mongo from '../server.js';
import config from '../config.js';
import collectionUtil from '../collectionUtil.js';
import utilities from '../utilities.js';
import bodyParser from 'body-parser';

var router = express.Router();



router.get('/',(req,res) => {
	//find user and test pass
	var user = req.user;
	user['confirmed'] = true;
	var query = {'email' : user.email };

	Mongo._update('users',query, user).then((resp) => {
		res.render("home",{ "email": user.email,
	 											"token": req.query.token,
												"password":"your_password"
											});
	})
	.catch((err) => {
		console.log(err);
		res.send("err");
	})
});

export default router;
