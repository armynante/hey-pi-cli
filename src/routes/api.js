import express from 'express';
import Mongo from '../server.js';
import bodyParser from 'body-parser';
import { ObjectID } from "mongodb";
import guests from './guests.js';
import utilities from '../utilities.js';
import _ from 'underscore';
var router = express.Router();

//assigns the users users or "guests" an api key and password.
//also deals with lost passwords
router.use('/guests',guests);

router.get('/collections', (req,res) => {
	Mongo.collectionNames().then((resp) => {
		//remove system collections like 'schemas' & 'system.indexes'
		var collections = [];

		_.each(resp.message, (doc) => {

			if(doc.name !== 'schemas' && doc.name !== 'system.indexes') {
				collections.push(doc)
			}

		});

		res.status(resp.code).json(collections);
	})
	.catch((err) => {
		console.log(err);
		res.json("error pulling collection names");
	})
})

router.post('/batch/:collection', (req,res) => {
	_.map(req.body.operations, (obj) => {
		if (obj.method === 'insert') {
			obj.document['heypi_id'] = req.user._id
		}
	});

	Mongo.batchOperation(req.params.collection,req.body.operations).then((resp) => {
		res.json(resp);
	})
	.catch((err) => {
		console.log(err);
		res.json(err);
	})
})

router.post('/batch_insert/:collection', (req,res) => {
		var docs = [];

		_.each(req.body, (obj) => {
			obj['heypi_id'] = req.user._id;
			docs.push({ method: "insert", document: obj })
		});
		Mongo.batchOperation(req.params.collection,docs).then((resp) => {
			res.json(resp);
		})
		.catch((err) => {
			res.json(err);
		})
})



router.get('/*', (req, res) => {

	//structure the query
	if (req.query.sort !== undefined && req.query.sort !== null)  {
		req.query.sort = utilities.sortParam(req.query.sort);
	} else {
		req.query.sort = {};
	}

	if (req.query.skip === undefined || req.query.skip === null)  req.query.skip = 0;
	if (req.query.limit === undefined || req.query.limit === null)  req.query.limit = 50;

	req.query.limit = parseInt(req.query.limit);
	req.query.skip = parseInt(req.query.skip);


	if(req.strip_path[0] !== undefined) {
 	  Mongo.getData(req.strip_path, req.user._id, req.query.skip, req.query.sort, req.query.limit).then((resp) => {
      req.user.reads++;
      Mongo.update('users',{'_id':req.user._id}, req.user);
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
	Mongo.saveData(req.strip_path, req.body, req.user._id).then((resp) => {

    req.user.writes++;
    req.user.numDocs++;

    Mongo.update("users",{"_id":req.user._id}, req.user);
		var loc = "/" + req.strip_path + "/" +resp.message.id;

		res.status(201).location(loc).json(resp.message)
	})
	.catch((err) => {
		res.status(err.code).json("error saving data");
	});
})

router.put('/*', (req,res) => {
	Mongo.updateData(req.strip_path, req.body, req.user._id).then((resp) => {
    req.user.writes++;
    Mongo.update('users',{'_id':new ObjectID(req.user._id)}, req.user);
		res.status(resp.code).json(resp.message);
	})
	.catch((err) => {
		res.status(500).json(err.message);
	});
})

router.delete('/*', (req,res) => {
	Mongo.delData(req.strip_path, req.user._id).then((resp) => {
    req.user.writes += resp.docDelta;
    req.user.numDocs -= resp.docDelta;
    Mongo.update('users',{'_id':new ObjectID(req.user._id)}, req.user);
		res.status(resp.code).json(resp.message);
	})
	.catch((err) => {
		res.status(err.code).json("error updating data");
	});
});

export default router
