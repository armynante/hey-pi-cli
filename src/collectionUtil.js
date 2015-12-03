"use strict";

var collectionUtil =  {
	findOne: function(collection, query){
		var promise = new Promise(
			(resolve, reject) => {
				collection.find(
					query,
					{heypi_id:0},
					(err, docs) => {
					docs.toArray((err, docArray) => {

						if (docArray.length > 1){
							reject({"message": "More than one doc found\n", "result": docArray});
						}
						else if (!docArray.length){
							reject({"message": "No documents found\n", "result": docArray});
						}
						else{
							resolve(docArray[0]);
						}
					});
				});
			}
		);
		return promise;
	},

	insertOne: function(collection, data) {
		var promise = new Promise(
			(resolve, reject) => {
				collection.insertOne(
					data,
					{heypi_id:0},
					function(err, result){
					if (err){
			  	  		reject(err);
			  	  	}
			  	  	else{
			  	  		resolve(result);
			  	  	}
				});
			}
		);
		return promise;
	},

	updateOne: function(collection, query, data) {

		var promise = new Promise (
			(resolve, reject) => {
					collection.updateOne(
						query,
						{ $set: data },
						{heypi_id:0},
						(err, result) => {
						if (err) {
							reject({"message":" Error updating doc: "  + err});
						} else {
							resolve({"message": "Successfully updated the document", "result": result});
						}
					}
				);
			}
		);
		return promise;
	}
};

export default collectionUtil;
