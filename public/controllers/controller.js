var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {


// Pulls list of games
$scope.pullGame = function() {
  var summonerName = $scope.game.name;
  console.log(summonerName);

  $http.get('/summonerName/' + summonerName).success(function(response) {
    console.log(response);
  });
};  









}]);