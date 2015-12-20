app.factory('Collections', function ($http) {

  var  http = function(method, url ,data) {
    req = {
      method: method,
      url: '/api/' + url
    }

    if (method === 'POST') req['data'] = data;

    return $http(req);
  }

  return {
    getDocs: function (query,colletion) {
      return http('GET',colletion + query,null);
    },
    get: function(){
      return http('GET','collections',null);
    },
    batch: function(data,batchOp,collection) {
      //remove hashkeys
      var docs = JSON.parse(angular.toJson(data)),
          batchArray = [];

      _.each(docs, function(doc){
        var op = { "method":batchOp, "document":doc };

        if (doc._id === null || doc._id === undefined || doc._id === '') {
          op.method ="insert";
        }

        batchArray.push(op)
      });
      debugger;
      return http('POST','batch/' + collection, { "operations": batchArray });
    }
  }
});
