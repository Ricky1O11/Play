 //controller for the popup dialog used to display the image
angular.module("play").controller('manageplayersDialogController', function(Utils, Api, $window, $route, $rootScope, $mdDialog, additional_field) {
	mp_controller=this;
	mp_controller.users={};  //list of users to display in the dropdown menu
	mp_controller.players= [];
	mp_controller.teams= {};
	mp_controller.removedPlayers = [];
	mp_controller.selValues = additional_field.match;

	// Search for players
	this.querySearchPlayers = function (query) {
		var query = query.toLowerCase();
		if (query != ""){
			mp_controller.endAt = query.substring(0, query.length-1) + 
						Utils.changeLetter(query.substring(query.length-1, query.length-0))
		}

		return Api.users(query, 20, "search_username", mp_controller.endAt, "").$loaded().then(function(response){
			mp_controller.users = [];
			console.log(response);
			for (i=0; i<response.length; i++){
				if(response[i].search_username.indexOf(query.toLowerCase()) !== -1){
					mp_controller.users[i] = 
						{
							uid: response[i].$id,
							username: response[i].username,
							image: response[i].image,
							points: 0,
						};
				}
			}
			return mp_controller.users;
		});
	}

	
	this.togglePlayer = function(act, user, team, index){
		if(user != undefined){
			if(act == "select"){
				if(!(user.uid in mp_controller.selValues.players)){
					mp_controller.players.push(user);
					mp_controller.selectedPlayer = "";
				}
			}
			else if(act == "move"){
				mp_controller.teams[team].splice(index, 1);
			}
			else if(act == "assign"){
				//mp_controller.players.splice(index, 1);
			}
			else if(act == "delete_from_team"){
				mp_controller.teams[team].splice(index, 1);
				mp_controller.removedPlayers.push({"player": player, "team": team});
			}
			else{
				mp_controller.players.splice(index, 1);
			}
		}
	}


	this.postPlayers = function(){
		console.log(mp_controller.removedPlayers);
		for(player in mp_controller.players){
			if(player in mp_controller.selValues.players)
				console.log("already in the match")
			else
				mp_controller.addPlayer(player);
		}

		for(pl of mp_controller.removedPlayers){
			mp_controller.removePlayer(pl["player"], pl["team"]);
		}
		$mdDialog.hide();
	}


	this.addPlayer = function(player){
		//for(i = 0; i < additional_field.rounds; i++){
		//	play = {}
		//	play["user"] = player;
		//	play["round"] = i+1;
		//	play["detailed_points"] = {};
		//	play["points"] = 0;
		//	for(j = 0; j< additional_field.match.template.scoring_fields.length; j++){
		//		scoring_field = additional_field.match.template.scoring_fields[j];
		//		play["detailed_points"][j] = scoring_field;
		//		play["detailed_points"][j]["points"] = 0;
		//	}
		//	play_post = Api.playpost(additional_field.match.$id, play)
		//}
		//simpleObject = {};
		//angular.copy(additional_field.match, simpleObject);
		//delete simpleObject["boardgame"]
		//delete simpleObject["plays"]
		//simpleObject["players"] = mp_controller.selValues.players
		//player_post = Api.playerpost(additional_field.match, simpleObject, mp_controller.selValues.players[player])
	}

	this.removePlayer = function(player, team){
		console.log(player, team)
		Api.playerdelete(additional_field.match, additional_field.match.players[player], player, team)
	}

	this.selectTemplate = function(template){
		console.log(mp_controller.selValues)
		for(team in template.teams){
			mp_controller.teams[template.teams[team].name[$rootScope.lang]] = [];
			for(pl in mp_controller.selValues.teams[template.teams[team].name[$rootScope.lang]].players){
				mp_controller.teams[template.teams[team].name[$rootScope.lang]].push(mp_controller.selValues.teams[template.teams[team].name[$rootScope.lang]].players[pl]);
			}
		}
	}

	mp_controller.selectTemplate(additional_field.match.template);
});