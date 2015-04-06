
/*
Given a list of champs
Win or Loss 
Modeller so data can be saved to mongo db
*/

exports.updateChamps = function (champs, winTrue, mongoModeller){
	champs.forEach(function(champ){
		if(winTrue){
			mongoModeller.update({id:champ}, { $inc: { wins: 1}}, function(err, newInfo){
				if(err) return handleError(err);
				console.log("Champ Updated - W");
			});
		}
		else{
			mongoModeller.update({id:champ}, { $inc: { losses: 1}}, function(err, newInfo){
				if(err) return handleError(err);
				console.log("Champ Updated - L");
			});
		}
    	});
};