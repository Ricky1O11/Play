 //controller for the popup dialog used to display the image
angular.module("play").controller('manageplayersDialogController', function(Api, $window, $route, $rootScope, $mdDialog, additional_field) {
	self=this;
	self.users = {};
	self.selectedValues = {}
	self.selectedValues.players = {};
	//api call to the list of users
	self.getUsers = function(){
		if(angular.equals(self.users, {}) && angular.equals(self.selectedValues.players, {})){
			Api.users().$loaded().then(function(data){
				for (i=0; i<data.length; i++){
					simpleUser = {}
					simpleUser["username"] = data[i]["username"];
					simpleUser["image"] = data[i]["image"];
					simpleUser["points"] = 0;
					simpleUser.uid = data[i].$id;

					if(simpleUser.uid in additional_field["match"]["players"]){
						self.selectedValues.players[""+simpleUser.uid] = simpleUser;
					}
					else{
						self.users[simpleUser.uid] = simpleUser;
					}
				}
			});
		}
	}
	
	this.togglePlayer = function(act, user){
		if(act == "select"){
			self.selectedValues.players[""+user.uid] = user;
			delete self.users[""+user.uid];
		}
		else{
			delete self.selectedValues.players[""+user.uid];
			self.users[""+user.uid] = user;;
		}
	}




	this.postPlayers = function(){
		for(player in self.selectedValues.players){
			if(player in additional_field.match.players)
				console.log("already in the match")
			else
				self.addPlayer(player);
		}

		for(player in additional_field.match.players){
			if(player in self.selectedValues.players)
				console.log("still in the match")
			else
				self.removePlayer(player);
		}
		console.log($rootScope.match)
		$mdDialog.hide();
	}


	this.addPlayer = function(player){
		for(i = 0; i < additional_field.rounds; i++){
			play = {}
			play["user"] = player;
			play["round"] = i+1;
			play["detailed_points"] = {};
			play["points"] = 0;
			for(j = 0; j< additional_field.match.template.scoring_fields.length; j++){
				scoring_field = additional_field.match.template.scoring_fields[j];
				play["detailed_points"][j] = scoring_field;
				play["detailed_points"][j]["points"] = 0;
			}
			play_post = Api.playpost(additional_field.match.$id, play)
		}
		simpleObject = {};
		angular.copy(additional_field.match, simpleObject);
		delete simpleObject["boardgame"]
		delete simpleObject["plays"]
		simpleObject["players"] = self.selectedValues.players
		player_post = Api.playerpost(additional_field.match, simpleObject, self.selectedValues.players[player])
	}

	this.removePlayer = function(player){
		Api.playerdelete(additional_field.match, additional_field.match.players[player])
	}
	
	self.getUsers();

});