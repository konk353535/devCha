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
    if(count % 300 == 0){
    	console.log("5 Minutes are over, BEGIN!");
    	// Working
    	// Testing if timer works with functions so far
    	// getEpoch(getUrfGames);
    }
    count--;
}
function liftOff(timer){
    timer.clearInterval();
    console.log('And we have liftoff!');
}
StartTime();
*/


getEpoch(getUrfGames);

// Will get setOfUrfGames
function getUrfGames(err, response){
	/*
	Using given epoch time, gets a list of urf match ids from riot api
	With match id list, passes to game manager
	Adds 300 to epoch timer so our next pull is {new data}
	*/
	if(err){
		console.log(err);
	}
	else {
		// Get current timer
		epoch_timer = response;
		console.log("Urf Games Recieved Epoch - " + epoch_timer);

		// Request Games
		request('https://oce.api.pvp.net/api/lol/oce/v4.1/game/ids?beginDate=' + epoch_timer + '&api_key=' + config.apikey , function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// Once game list recieved, pass to game handler
				console.log(body); // Show the HTML for the Google homepage. 
				Game_Manager(null, body, Game_Extractor);
			}
		});

		// Add 300 to current timer
		epoch_timer += 300;

		// Update Timer (update firebase row)
		var upvotesRef = new Firebase('https://boiling-inferno-4886.firebaseio.com/epoch');
		upvotesRef.transaction(function (current_value) {
		  return (current_value || 0) + 300;
		});
	}

}


function getEpoch(callback){
	/*
	Function gets from firebase the current epoch time to use for api calls
	*/
	var ref = new Firebase("https://boiling-inferno-4886.firebaseio.com/epoch");
	
	ref.once("value", function(snapshot) {
	  // Success
	  console.log("Current Epoch - " + snapshot.val());
	  callback(null, snapshot.val());
	  
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	  callback("Failure", null);
	});
}

function Game_Manager(err, response, callback){
	/*
	Splits all the game's we're given into single games
	Passes each single match id to Game_Extractor for further extraction!
	*/
	if(err){
		console.log(err);
	}
	else{
		// Splitting our json into single parts
		console.log("Game Manager got - Unformatted Games");
		// Remove [ and ]
		response = response.replace('[', '');
		response = response.replace(']', '');

		// Split individual games apart, place in Games array
		Games = response.split(",");
		console.log("Game Manager - Split individual games");

		// Iterate over single games
		for(var i = 0; i<Games.length; i++){
			match_id = Games[i];
			console.log(match_id + " sent to extractor");
			Game_Extractor(match_id);
		}
		
	}
}
function Game_Extractor(match_id){
	/*
	Extracts the individual information from the match id
	*/
	console.log("Extractor Recieved " + match_id);
	var t1_Champs = [];
	var t2_Champs = [];
	var t1_won;

	// Using match id
	// Request more information
	// Using RITO api
	request('https://oce.api.pvp.net/api/lol/oce/v2.2/match/' + match_id + '?includeTimeline=false&api_key=' + config.apikey , function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    Game_Data = JSON.parse(body);
	    console.log("Match Type - " + Game_Data["matchType"]);

	    Players = Game_Data["participants"];
	    // For each player in the game
	    Players.forEach(function(player){
	    	champ_id = player["championId"];

	    	if(player["teamId"] == 100){
	    		t1_Champs.push(champ_id);
	    	}
	    	else {
	    		t2_Champs.push(champ_id);
	    	}
	    	console.log(champ_id);
	    });

	    // Which team won?
	    teams = Game_Data["teams"];
	    teams.forEach(function(team){
	    	if(team["teamId"] == 100){
	    		if(team["winner"] == true){ t1_won = true; }
	    		else { t1_won = false; }
	    	}
	    	else{
	    		if(team["winner"] == true){ t1_won = false; }
	    		else { t1_won = true; }
	    	}
	    });

	    if(t1_won == true){console.log("Team 100 Won");}
	    else{console.log("Team 200 Won");}

	  }
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