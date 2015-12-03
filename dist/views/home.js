var app = angular.module('heypi', ['ngMaterial','ui.router']);

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
          $http({
            method: 'GET',
            url: '/api/' + $stateParams.name,
            headers: {'x-access-token':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFuZHJldy5hcm1lbmFudGVAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmEkMTAkVmoyb1lSYXFZUkR4aDJjQVN4UU82dWxwLmJTazcyNldPblI3NzJ0dEkudGF1RU51Ri55bXkiLCJjb25maXJtZWQiOmZhbHNlLCJudW1Db2xzIjowLCJudW1Eb2NzIjowLCJpc0d1ZXN0IjpmYWxzZSwidXNlcnNJZCI6bnVsbCwid3JpdGVzIjowLCJyZWFkcyI6MCwiY3JlYXRlZE9uIjoiMjAxNS0xMS0yNVQwNDo0MjozNC41OTVaIiwiX2lkIjoiNTY1NTNjNTZmNGMwNzgyNzc2OTBiYTFhIiwiaWF0IjoxNDQ4NDI2NTgyLCJleHAiOjE0NTAxNTQ1ODJ9.GFEk2S9qUNzdKcHjOvUU2ThRm25J9h2CDvcLgjJclJI'}
          }).then(function successCallback(response) {
                $scope.docs = response.data;
            }, function errorCallback(response) {
              console.log(response);
          });

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
