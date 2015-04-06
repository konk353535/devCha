

exports.t1_won = function(teams){
	// If team 100 won, t1_won (true), else t1_won (false)
	teams.forEach(function(team){
		if(team["teamId"] == 100){ 
			if(team["winner"] == true){ 
				t1_won = true; 
			} 
			else { 
				t1_won = false; 
			}
		}
		else{ 
			if(team["winner"] == true){
				t1_won = false; 
			} 
			else { 
				t1_won = true; 
			}
		}
	});
	return t1_won;
};


