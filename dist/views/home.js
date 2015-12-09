var app = angular.module('heypi', ['ngMaterial','ui.router','md.data.table']);

app.config(function($stateProvider,$mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('light-blue');

  $stateProvider
  .state('collections', {
      url:'/collections',
      templateUrl: '/templates/collections',
      controller: 'AppController'
    })
  .state('collections.collectionTable', {
      url:'/:name',
      templateUrl: '/templates/collectionTable',
      controller: function($stateParams, $scope, $http) {

        $scope.collectionName = $stateParams.name

        function getData(query) {
          if (query === undefined || query === null) query = '';
          var http = $http({
            method: 'GET',
            url: '/api/' + $stateParams.name + query,
            headers: {'x-access-token':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFuZHJldy5hcm1lbmFudGVAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmEkMTAkVmoyb1lSYXFZUkR4aDJjQVN4UU82dWxwLmJTazcyNldPblI3NzJ0dEkudGF1RU51Ri55bXkiLCJjb25maXJtZWQiOmZhbHNlLCJudW1Db2xzIjowLCJudW1Eb2NzIjowLCJpc0d1ZXN0IjpmYWxzZSwidXNlcnNJZCI6bnVsbCwid3JpdGVzIjowLCJyZWFkcyI6MCwiY3JlYXRlZE9uIjoiMjAxNS0xMS0yNVQwNDo0MjozNC41OTVaIiwiX2lkIjoiNTY1NTNjNTZmNGMwNzgyNzc2OTBiYTFhIiwiaWF0IjoxNDQ4NDI2NTgyLCJleHAiOjE0NTAxNTQ1ODJ9.GFEk2S9qUNzdKcHjOvUU2ThRm25J9h2CDvcLgjJclJI'}
          })
          return http;
        }

        getData().then(function(docs) {
          $scope.docs = docs.data;
        })

          $scope.selected = [];

          $scope.query = {
            filter: '',
            order: 'name',
            limit: 5,
            page: 1
          };

          // in the future we may see a few built in alternate headers but in the mean time
          // you can implement your own search header and do something like
          $scope.search = function (predicate) {
            $scope.filter = predicate;
            $scope.deferred = $nutrition.desserts.get($scope.query, success).$promise;
          };

          $scope.onOrderChange = function (order) {
            var direction = '';

            if (order[0] === '-') {
              direction = '_down';
              order.slice(0,1);
            } else {
              direction = '_down';
            }

            var query = '?sort=' + order + direction;

            getData(query).then(function(docs) {
              $scope.docs = docs.data;
            })
          };

          $scope.onPaginationChange = function (page, limit) {
            return $nutrition.desserts.get($scope.query, success).$promise;
          };


      }
    })
  .state('docs', {
      url:'/docs',
      templateUrl: '/templates/docs',
      controller: 'AppController'
    })
})

app.controller('AppController', function($mdSidenav,$http,$scope) {
  var vm = this;

  vm.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

  var getCollections = function() {
    $http({
      method: 'GET',
      url: '/api/collections',
      headers: {'x-access-token':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFuZHJldy5hcm1lbmFudGVAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmEkMTAkVmoyb1lSYXFZUkR4aDJjQVN4UU82dWxwLmJTazcyNldPblI3NzJ0dEkudGF1RU51Ri55bXkiLCJjb25maXJtZWQiOmZhbHNlLCJudW1Db2xzIjowLCJudW1Eb2NzIjowLCJpc0d1ZXN0IjpmYWxzZSwidXNlcnNJZCI6bnVsbCwid3JpdGVzIjowLCJyZWFkcyI6MCwiY3JlYXRlZE9uIjoiMjAxNS0xMS0yNVQwNDo0MjozNC41OTVaIiwiX2lkIjoiNTY1NTNjNTZmNGMwNzgyNzc2OTBiYTFhIiwiaWF0IjoxNDQ4NDI2NTgyLCJleHAiOjE0NTAxNTQ1ODJ9.GFEk2S9qUNzdKcHjOvUU2ThRm25J9h2CDvcLgjJclJI'}
    }).then(function successCallback(response) {
        $scope.collections = response.data;
      }, function errorCallback(response) {
        console.log(response);
    });
  }

  getCollections();

});
