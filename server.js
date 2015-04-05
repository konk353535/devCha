// Config file for apiKey ect
var config = require('./config/config');

// Express
var express = require('express');
var app = express();
app.use(express.static(__dirname + "/public"));

// Request for api calls
var http = require('http');
var request = require('request');

// Mongoose DB connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/champions');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
  console.log("Yay!");
});

// Define schema
var ChampionSchema = mongoose.Schema({
    name  :  { type: String, default: 'hahaha' }
  , wins   :  { type: Number, min: 0, index: true }
  , losses   :  { type: Number, min: 0, index: true }
});



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
    if(count % 30 == 0){
    	console.log("5 Minutes are over, BEGIN!");
    	getEpoch(getUrfGames);
    }
    count--;
}
function liftOff(timer){
    timer.clearInterval();
    console.log('And we have liftoff!');
}

// StartTime();

// Starting implementing the mongo db, over the fire base db
// Actually working on mongo version of devCha

app.get('/getGameData', function(req, res){
	
	var ref = new Firebase("https://boiling-inferno-4886.firebaseio.com/champion");
	
	ref.once("value", function(snapshot) {
	  // Success
	  res.json(snapshot.val());
	  
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	  //callback("Failure", null);
	});
	
});



function getUrfGames(err, response){
	/*
	Given epoch time, retrieve list of match ids
	Pass list of match id's to Game_Manager 
	Adds 300s to epoch (so we get new set of games next run)
	*/
	if(err){
		console.log(err);
	}
	else {
		// Get current timer
		epoch_timer = response;
		console.log("Urf Games Recieved Epoch - " + epoch_timer);

		// Request Games From Dev Challenge End Point
		request('https://oce.api.pvp.net/api/lol/oce/v4.1/game/ids?beginDate=' + epoch_timer + '&api_key=' + config.apikey , function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body);
				// Once game list recieved, pass to game handler
				Game_Manager(null, body, Game_Extractor);
			}
		});

		// Update Timer (update firebase field)
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
	Updates firebase db depending on - champ Id - Win/loss
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
	    // Convert string data to json object
	    Game_Data = JSON.parse(body);
	    console.log("Match Type - " + Game_Data["matchType"]);

	    // Pull participant data from json
	    Players = Game_Data["participants"];

	    // Iterate over each player 
	    Players.forEach(function(player){
	    	// Get players champion
	    	champ_id = player["championId"];
	    	// Depending on team push to t1/t2 array
	    	if(player["teamId"] == 100){
	    		t1_Champs.push(champ_id);
	    	}
	    	else {
	    		t2_Champs.push(champ_id);
	    	}
	    	console.log(champ_id);
	    });

	    // If team 100 won, t1_won set to true, 
	    // else t1_won set to false
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

	    // Depending on winner, make addition to our db
	    if(t1_won == true){
	    	console.log("Team 100 Won");
	    	// + 1 wins to all champs in team 100
	    	t1_Champs.forEach(function(champ){
	    		// Update champ win count
			var upvotesRef = new Firebase('https://boiling-inferno-4886.firebaseio.com/champion/' + champ + '/wins');
			upvotesRef.transaction(function (current_value) { return (current_value || 0) + 1; });
	    	});
	    	// + 1 losses to all champs in team 200
	    	t2_Champs.forEach(function(champ){
	    		// Update champ loss count
			var upvotesRef = new Firebase('https://boiling-inferno-4886.firebaseio.com/champion/' + champ + '/losses');
			upvotesRef.transaction(function (current_value) { return (current_value || 0) + 1; });
	    	});
	    }
	    else{
	    	console.log("Team 200 Won");
	    	// + 1 wins to all champs in team 200
	    	t2_Champs.forEach(function(champ){
	    		// Update champ win count
			var upvotesRef = new Firebase('https://boiling-inferno-4886.firebaseio.com/champion/' + champ + '/wins');
			upvotesRef.transaction(function (current_value) { return (current_value || 0) + 1; });
	    	});
	    	// + 1 losses to all champs in team 100
	    	t1_Champs.forEach(function(champ){
	    		// Update champ loss count
			var upvotesRef = new Firebase('https://boiling-inferno-4886.firebaseio.com/champion/' + champ + '/losses');
			upvotesRef.transaction(function (current_value) { return (current_value || 0) + 1; });
	    	});
	    }
	  }
	});

}

// List on port 3000
app.listen(3000);
console.log("Server running on port 3000");