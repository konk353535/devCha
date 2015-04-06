var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {


// Pulls list of games
$scope.pullGame = function() {
	getGameData();
};  

getGameData();

// Orders by total games
$scope.getTotalGames = function(champion) {
	return champion.wins + champion.losses;
};

$scope.getTotal = function(){
	var total = 0;
	for(var i = 0; i < $scope.championlist.length; i++){
	    var champion = $scope.championlist[i];
	    total += (champion.wins + champion.losses);
	}
	return total;
}

function getGameData(){
	$http.get('/getGameData').success(function(response) {
		console.log(response);
		$scope.championlist = response;
	});
}


}]);