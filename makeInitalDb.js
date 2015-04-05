createInitial();
function createInitial(){

	request('https://global.api.pvp.net/api/lol/static-data/oce/v1.2/champion?api_key=' + config.apikey , function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);
			// Once game list recieved, pass to game handler
			
			champions = JSON.parse(body);

			champions = champions["data"];

			for(var champion in champions){
				champion_info = champions[champion];

		    		champ_id = champion_info["id"];
		    		champ_name = champion_info["name"];
		    		console.log(champ_id);
		    		
		    		var Teemo = new Champion({name: champ_name, wins: 0, losses: 0, id: champ_id});

				Teemo.save(function (err, Teemo) {
				  if (err) return console.error(err);
				  champSaved();
				});
				
		    	}
		}
	});
}