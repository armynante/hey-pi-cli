var app = angular.module('heypi', ['ngMaterial','ui.router','md.data.table']);

app.config(function($stateProvider,$mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('light-blue');

  $stateProvider
  .state('collections', {
      url:'/collections',
      templateUrl: '/templates/collections',
      resolve: {
        collections: function(Collections) {
            return Collections.get();
          }
      },
      controller: 'CollectionsCtrl'
    })

  .state('collections.collectionTable', {
      url:'/:name',
      resolve: {
        documents: function(Collections,$stateParams) {
          return Collections.getDocs('?limit=10',$stateParams.name);
        },
        collectionName: function($stateParams) {
          return $stateParams.name;
        },
      },
      templateUrl: '/templates/collectionTable',
      controller: 'tableCtrl'
    })

  .state('docs', {
      url:'/docs',
      templateUrl: '/templates/docs',
      controller: 'AppController'
    })
})
