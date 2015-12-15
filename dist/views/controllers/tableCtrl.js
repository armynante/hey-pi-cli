app.controller('tableCtrl', function($mdSidenav, $http, $scope, $filter, documents, Collections, collectionName) {

 var vm = this;
 $scope.docs = documents.data;
 $scope.headers = _.without(_.keys(documents.data.documents[0]),'_id');
 $scope.editMode = false;
 $scope.addMode = false;
 $scope.selected = [];
 $scope.docsToAdd = [];
 $scope.modelObject = {};
 $scope.blankObj = {};

 $scope.query = {
   filter: '',
   order: 'id',
   limit: 10,
   page: 1,
   string: ''
 };

 $scope.toggleEdit = function() {
   $scope.editMode = !$scope.editMode;
 }

 $scope.saveItems = function() {
   //TODO: seperate out adding and updated;
   var data = $scope.docsToAdd.concat($scope.docs.documents);
   Collections.batch(data,'update',collectionName).then(function(resp) {
     debugger
     $scope.editMode = false;
    //  location.reload();
   });

 }

 $scope.deleteItems = function() {
   Collections.batch($scope.selected, 'delete', collectionName).then(function(resp){
     $scope.docs.documents = _.difference($scope.docs.documents,$scope.selected);
   })
 }

 $scope.addItem = function() {
   $scope.docs.documents.splice(0,$scope.blankObj);
   $scope.docsToAdd.push(angular.copy($scope.blankObj));
   $scope.editMode = true;
   $scope.addMode = true;
 }

 var buildQueryString = function() {
   //order
   var direction = '',
       order = $scope.query.order;
   if (order[0] === '-') {
     direction = '_down';
     order = order.substr(1);
   } else {
     direction = '_up';
   }

   var limit = 'limit=' + $scope.query.limit,
       orderStr = '?sort=' + order + direction + '&';
       skip  = '&skip=' + ($scope.query.page - 1) * $scope.query.limit

   return  orderStr  + limit + skip;
 }

 $scope.onOrderChange = function (order) {
  var qs = buildQueryString();
  console.log(qs);
  Collections.getDocs(qs,collectionName).then(function(docs) {
     $scope.docs = docs.data;
   })
 };

 $scope.onPaginationChange = function (page, limit) {
   var qs = buildQueryString();
   Collections.getDocs(qs,collectionName).then(function(docs) {
      $scope.docs = docs.data;
    })
  };

 vm.toggleSidenav = function(menuId) {
   $mdSidenav(menuId).toggle();
 };


});
