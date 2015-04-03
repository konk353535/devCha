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

// List on port 3000
app.listen(3000);
console.log("Server running on port 3000");