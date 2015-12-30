app.controller('mainCtrl', function($mdSidenav, $scope) {
console.log("controler loaded");
 var vm = this;

 $scope.toggleSidenav = function(menuId) {
   console.log("toggle")
   $mdSidenav(menuId).toggle();
 };

});
