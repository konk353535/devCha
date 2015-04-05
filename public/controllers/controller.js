var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {


// Pulls list of games
$scope.pullGame = function() {
  console.log("Here");
  $http.get('/getGameData').success(function(response) {
    console.log(response);
    $scope.championlist = response;
  });

};  









}]);