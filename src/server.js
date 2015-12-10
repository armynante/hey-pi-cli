"use strict";

import { MongoClient } from './MongoClient.js';
import config from './config.js';
import jwt from 'jsonwebtoken';
import utilities from './utilities.js';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { ObjectID } from 'mongodb';
import path from 'path';

//routers
import auth from './routes/auth.js';
import register from './routes/register.js';
import confirm from './routes/confirm.js';
import api from './routes/api.js';

//initialize express:
var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views')
app.use(express.static('public'));
app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));
//load the database
var Mongo = new MongoClient();
export default Mongo;
Mongo._dbConnect(config.mongoUrl);

//setiings
app.use(morgan('dev')); //logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middlewares
var checkAuth = function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, config.secret, (err, validUser) => {
			if (err) {
				res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				Mongo._get('users',{'_id': new ObjectID(validUser._id)}).then((docs) => {
					if (docs.length > 0) {
						req.user = docs[0]
						next();
					} else {
						res.status(500).json({success:false, message:"Token authentication failed, can't a find user with that token. Please re-authorize and try again."});
					}
				})
				.catch((err) => {
					res.code(500).json(err.message);
				});
				//user is stuck withthe token vesion// need to re load the user object
			}
		});
	} else {
		res.status(401).json({ success: false, message: 'Failed to provide authentication token.' });
	}
}

var confirmed = function(req, res, next) {
	if (!req.user.confirmed) {
		res.status(400).json({success: false, message: "please confirm account"});
	} else {
		next();
	}
}

var urlStrip = function(req, res, next) {
	req.strip_path = utilities.stripPath(req.url);
	next();
};

//pre-auth routes
app.get('/', function(req,res) {
	res.render('home', {"email":"mr.mixx@naazdy.net","token":"LONG_ASS_TOKEN","password":"your_password"})
});

//for loading jade partials
app.get('/templates/:template', function(req,res) {
	res.render('templates/' + req.params.template);
})

app.use('/register', register);
app.use('/authorize', auth);

//check authentication before proceeding to api
app.use(checkAuth);

//confirmation
app.use('/confirm', confirm);
app.use(confirmed);

//strip path
app.use(urlStrip);

//api routes
app.use('/api', api);

app.get('*', function(req, res){
  res.send('can\'t find that!', 404);
});


var server = app.listen(config.port, function() {
	console.log('Listening at http://localhost:%s', config.port);
});
