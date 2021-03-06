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
  , id   :  { type: Number, min: 0, index: false }
});
var Champion = mongoose.model('Champion', ChampionSchema);

// Define Epoch Schema
var EpocherSchema = mongoose.Schema({
	CurrentEpoch: {type:Number, min: 0}
});
var CurrentEpoch = mongoose.model('Epocher', EpocherSchema);

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


// Start Timer
StartTime();


app.get('/getGameData', function(req, res){
	/*
	Returns ordered list of champion db (name, wins, losses) (ordered by wins)
	*/
	Champion.find().sort({wins: -1}).exec(function (err, ChampionData) {
	  if (err) return console.error(err);
	  console.log(ChampionData);
	  res.json(ChampionData)
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

		var EpochId = "55213867fc92d4693fb1d0a0";

		// Update Timer
		CurrentEpoch.update({"CurrentEpoch": {$gt:0}}, { $inc: { CurrentEpoch: 300}}, function(err, newInfo){
			if(err) return handleError(err);
			console.log(newInfo);
		});
	}
}


function getEpoch(callback){
	/*
	Function gets from mogno the current epoch time to use for api calls
	*/
	CurrentEpoch.find(function (err, CurrentEpoch) {
	  // Error
	  if (err) return console.error(err);
	  // Got data from db
	  EpochJson = CurrentEpoch[0];
	  CurrentEpochTime = EpochJson["CurrentEpoch"];
	  callback(null, CurrentEpochTime);
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
	    });

	    teams = Game_Data["teams"];

	    // Require module to find which team won
	    var whoWon = require('./whoWon.js');
	    t1_won = whoWon.t1_won(teams);

	    // Require module to update champ stats (win, losses)
	    var champUpdater = require('./updateChampData.js');

	    // Update both teams champions
	    champUpdater.updateChamps(t1_Champs, t1_won, Champion);
	    champUpdater.updateChamps(t2_Champs, !t1_won, Champion);

	  }
	});
}

// List on port 3000
app.listen(3000);
console.log("Server running on port 3000");