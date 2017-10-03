  //controller for the popup dialog used to display the image
angular.module("play").controller('manageplayersDialogController', function(Utils, Api, $window, $route, $rootScope, $mdDialog, additional_field) {
	mp_controller=this;
	mp_controller.users={};  //list of users to display in the dropdown menu
	mp_controller.players= [];
	mp_controller.teams= {};
	mp_controller.removedPlayers = [];
	mp_controller.selValues = additional_field.match;
	console.log(additional_field.rounds)
	// Search for players
	this.querySearchPlayers = function (query) {
		var query = query.toLowerCase();
		if (query != ""){
			mp_controller.endAt = query.substring(0, query.length-1) + 
						Utils.changeLetter(query.substring(query.length-1, query.length-0))
		}

		return Api.users(query, 20, "search_username", mp_controller.endAt, "").$loaded().then(function(response){
			mp_controller.users = [];
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
				mp_controller.removedPlayers.push({"player": user, "team": team});
				mp_controller.teams[team].splice(index, 1);
			}
			else if(act == "assign"){
				mp_controller.players.splice(index, 1);
			}
			else if(act == "delete_from_team"){
				mp_controller.removedPlayers.push({"player": user, "team": team});
				mp_controller.teams[team].splice(index, 1);
			}
			else{
				if(user.uid in mp_controller.selValues.players){
					mp_controller.removedPlayers.push({"player": user, "team": ''});
				}
				mp_controller.players.splice(index, 1);
			}
		}
	}


	this.postPlayers = function(){
		//add players
		if(mp_controller.selValues.template.playersOrganization == "all vs all"){
			for(player in mp_controller.players){
				if(!(mp_controller.players[player].uid in mp_controller.selValues.players))
					mp_controller.addPlayer(mp_controller.players[player], '');
			}
		}
		//edit teams
		else{
			for(let te in mp_controller.teams){
				team = mp_controller.teams[te];
				for(player of team){
					if(!(player.uid in mp_controller.selValues.teams[te]["players"])){
						mp_controller.addPlayer(player, te);
					}
				}
				
			}
		}
		


		//remove players
		for(pl of mp_controller.removedPlayers){
			mp_controller.removePlayer(pl["player"], pl["team"]);
		}
		$mdDialog.hide();
	}


	this.addPlayer = function(player, team){

		simpleObject = {};
		angular.copy(additional_field.match, simpleObject);
		delete simpleObject["boardgame"];
		delete simpleObject["plays"];
		delete simpleObject["$id"];
		delete simpleObject["$priority"];
		delete simpleObject["$$hashKey"];
		delete player.$$hashKey;

		simpleObject["players"] = mp_controller.selValues.players;
		simpleObject["players"][player.uid] = player;
		for(pl in simpleObject["players"]){
			delete simpleObject["players"][pl]["$$hashKey"];
		}

		if(team == ''){
			for(i = 0; i < additional_field.rounds; i++){
				play = mp_controller.preparePlay(player, i);
				play_post = Api.playpost(additional_field.match.$id, play)
			}
			player_post = Api.playerpost(additional_field.match, simpleObject, player, team)
		}
		else{
			simpleObject["teams"] = mp_controller.selValues.teams;
			simpleObject["teams"][team]["players"][player.uid] = player;
			for(let te in simpleObject["teams"]){
				delete simpleObject["teams"][te]["$$hashKey"];
				for(pl in simpleObject["teams"][te]["players"]){
					delete simpleObject["teams"][te]["players"][pl]["$$hashKey"];
				}
			}
			player_post = Api.playerpost(additional_field.match, simpleObject, player, team)
		}
	}

	this.removePlayer = function(player, team){
		Api.playerdelete(additional_field.match, additional_field.match.players[player], player, team)
	}

	this.preparePlay = function(player, round){
		play = {}
		play["user"] = player.uid;
		play["round"] = round+1;
		if(mp_controller.selValues.template.howToScore == "win/lose"){
			play["round_winner"] = false;
		}
		else{
			play["detailed_points"] = {};
			play["points"] = 0;
			for(j = 0; j< mp_controller.selValues.template.scoring_fields.length; j++){
				scoring_field = mp_controller.selValues.template.scoring_fields[j];
				play["detailed_points"][j] = scoring_field;
				play["detailed_points"][j]["points"] = 0;
			}
		}
		return play;
	}

	this.selectTemplate = function(template){
		if(template.teams){
			for(team in template.teams){
				mp_controller.teams[template.teams[team].name[$rootScope.lang]] = [];
				for(pl in mp_controller.selValues.teams[template.teams[team].name[$rootScope.lang]].players){
					mp_controller.teams[template.teams[team].name[$rootScope.lang]].push(mp_controller.selValues.teams[template.teams[team].name[$rootScope.lang]].players[pl]);
				}
			}
		}
		else{
			for(pl in mp_controller.selValues.players){
				mp_controller.players.push(mp_controller.selValues.players[pl]);
				
			}
		}
	}

	mp_controller.selectTemplate(additional_field.match.template);
});