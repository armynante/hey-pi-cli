app.factory('Collections', function ($http) {

  var  http = function(method, url ,data) {
    req = {
      method: method,
      url: '/api/' + url,
      headers: {'x-access-token':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjU1M2M1NmY0YzA3ODI3NzY5MGJhMWEiLCJlbWFpbCI6ImFuZHJldy5hcm1lbmFudGVAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmEkMTAkVmoyb1lSYXFZUkR4aDJjQVN4UU82dWxwLmJTazcyNldPblI3NzJ0dEkudGF1RU51Ri55bXkiLCJjb25maXJtZWQiOnRydWUsIm51bUNvbHMiOjAsIm51bURvY3MiOjE2LCJpc0d1ZXN0IjpmYWxzZSwidXNlcnNJZCI6bnVsbCwid3JpdGVzIjoyMywicmVhZHMiOjIxNDIsImNyZWF0ZWRPbiI6IjIwMTUtMTEtMjVUMDQ6NDI6MzQuNTk1WiIsInVwZGF0ZWRfYXQiOjE0NTAxMzA1NzA3ODAsImlhdCI6MTQ1MDE5NjQ4NiwiZXhwIjoxNDUyNzg4NDg2fQ.jW2KoyLK8kGZwONYYlYBOLpmMpcfKrBTzo3e-HaS7HM'}
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
