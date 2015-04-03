// Config file for apiKey ect
var config = require('./config/config');

// Express
var express = require('express');
var app = express();
app.use(express.static(__dirname + "/public"));

// Request for api calls
var http = require('http');
var request = require('request');

// Firebase for database
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://boiling-inferno-4886.firebaseio.com/");

// lol-js for riot api calls
var lol = require('lol-js');
var lolClient = lol.client({
    apiKey: config.apikey,
    defaultRegion: 'oce',
    cache: null
});
/*
// Vars for our timer
var NanoTimer = require('nanotimer');
var count = 360000;
// Functions for timer 
function StartTime(){
    var timer = new NanoTimer();

    timer.setInterval(countDown, '', '1s');
    timer.setTimeout(liftOff, [timer], '360000s');

}
function countDown(){
	// Every 5 minutes this will occur
    if(count % 300== 0){
    	console.log("5 Minutes are over, BEGIN!");
    	getUrfGames();
    }
    count--;
}
function liftOff(timer){
    timer.clearInterval();
    console.log('And we have liftoff!');
}
StartTime();
*/



var myCallback = function(data) {
  console.log('got data: '+data);
};

var usingItNow = function(callback) {
  callback('get it?');
};

usingItNow(myCallback);

// Will get setOfUrfGames
function getUrfGames(err, response){
	if(err){
		console.log(err);
	}
	else {
		// Get current timer
		epoch_timer = response;
		console.log(epoch_timer);
		
		// Request Games
		request('https://oce.api.pvp.net/api/lol/oce/v4.1/game/ids?beginDate=' + epoch_timer + '&api_key=' + config.apikey , function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body) // Show the HTML for the Google homepage. 
			}
		});

		// Add 300 to current timer

		// Update Timer
	}

}
getEpoch(getUrfGames);

function getEpoch(callback){
	/*
	Function gets from firebase the current epoch time to use for api calls
	*/
	var ref = new Firebase("https://boiling-inferno-4886.firebaseio.com/epoch");
	
	ref.on("value", function(snapshot) {
	  // Success
	  console.log("Current Epoch - " + snapshot.val());
	  callback(null, snapshot.val());
	  
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	  callback("Failure", null);
	});
}
/*
if(microsecs / 1000 % 30 == 0){
	console.log(microsecs/1000);
}
*/
/*
request('https://oce.api.pvp.net/api/lol/oce/v4.1/game/ids?beginDate=1427896800&api_key=' + config.apikey , function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage. 
  }
})

// Example pushing of data to fire base
myFirebaseRef.push({
  name: "Jason",
});


// Example getting data from fire base (request might be easier...?)
var ref = new Firebase("https://boiling-inferno-4886.firebaseio.com/");
// Attach an asynchronous callback to read the data at our posts reference
ref.on("value", function(snapshot) {
  console.log(snapshot.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});


// Once click from client, calls this route
app.get('/summonerName/:summonerName', function(req, res){
	var sn = req.params.summonerName;
	console.log(sn);

	// Example use of lol-js
	lolClient.getChampionById(53, {champData: ['all']}, function(err, data) {
	    console.log("Found ", data.name);
	    lolClient.destroy();
	    res.writeHead(200, {"Content-Type": "text/plain"});
	    res.end("Hello Connect");
	});


});
*/

// List on port 3000
app.listen(3000);
console.log("Server running on port 3000");