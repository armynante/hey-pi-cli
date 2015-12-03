import express from 'express';
import Mongo from '../server.js';
import bodyParser from 'body-parser';
import { ObjectID } from "mongodb";
import guests from './guests.js';

var router = express.Router();

//assigns the users users or "guests" an api key and password.
//also deals with lost passwords
router.use('/guests',guests);

router.get('/collections', (req,res) => {
	Mongo.collectionNames().then((resp) => {
		res.status(resp.code).json(resp.message);
	})
	.catch((err) => {
		console.log(err);
		res.json("error pulling collection names");
	})
})

router.get('/*', (req, res) => {
		if(req.strip_path[0] !== undefined) {
	 		Mongo._getData(req.strip_path, req.user._id).then((resp) => {
        req.user.reads++;
        Mongo._update('users',{'_id':req.user._id}, req.user);
				res.status(resp.code).json(resp.message);
			})
			.catch((err) => {
				res.json("error querying path " + req.strip_path);
			});
		} else {
			res.status(404).json("Hi!");
		}
	});

router.post('/*', (req,res) => {
		Mongo._saveData(req.strip_path, req.body, req.user._id).then((resp) => {
      req.user.writes++;
      req.user.numDocs++;
      Mongo._update('users',{'_id':req.user._id}, req.user);
			res.json(resp.message);
		})
		.catch((err) => {
			res.status(err.code).json("error saving data");
		});
	})

router.put('/*', (req,res) => {
		Mongo._updateData(req.strip_path, req.body, req.user._id).then((resp) => {
      req.user.writes++;
      Mongo._update('users',{'_id':new ObjectID(req.user._id)}, req.user);
			res.status(resp.code).json(resp.message);
		})
		.catch((err) => {
			res.status(500).json(err.message);
		});
	})

router.delete('/*', (req,res) => {
		Mongo._delData(req.strip_path, req.user._id).then((resp) => {
      debugger;
      req.user.writes += resp.docDelta;
      req.user.numDocs -= resp.docDelta;
      Mongo._update('users',{'_id':new ObjectID(req.user._id)}, req.user);
			res.status(resp.code).json(resp.message);
		})
		.catch((err) => {
			res.status(err.code).json("error updating data");
		});
	});

export default router
