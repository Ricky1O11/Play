//controller for the popup dialog used to insert a new match
angular.module("play").controller('matchesDialogController', function($scope, Utils, Api, $filter, $rootScope, $mdDialog, $location, user_pk, additional_field) {
	// list of `state` value/display objects
	self=this;
	self.range = Utils.range;
	self.user_pk = user_pk;
	self.currentTab=0 //holds the current tab id
	self.title= "Add Match"; //sets the tab title according to its id
	

	
	self.selectedValues={
		"players": {}, //list that holds the list of player playing the inserted match
		"name": "",
		"location": "No Location",
		"time": new Date(),
		"duration": 0,
		"winner": "",
		"completed": false,
		"inserted_at": "",
		"expansions": [],
		"teams" : {}
	}; //dictionary that holds the values inserted by the user (time, location, game title, etc)


	if(additional_field != -1){
		self.selectedValues.boardgame = additional_field;
	}
	
	self.boardgames=[]; //list of boardgames to display in the dropdown menu
	self.expansions = [];
	self.users={};  //list of users to display in the dropdown menu
	self.players= [];
	self.teams= {};
	self.templates=[]; //list that holds the list of templates available in the db
	
	self.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.

	//Search for boardagames
	self.querySearchBoardgames = function (query) {
		var query = query.toLowerCase();
		if (query != ""){
			self.endAt = query.substring(0, query.length-1) + 
						Utils.changeLetter(query.substring(query.length-1, query.length-0))
		}

		return Api.boadgames(query, 20, "search_name", self.endAt, "").$loaded().then(function(response){
			self.boardgames = [];
			for (i=0; i<response.length; i++){
				if(response[i].search_name.indexOf(query.toLowerCase()) !== -1)
					self.boardgames[i] = 
						{
							name: response[i].name,
							bggId: response[i].bggId,
							thumbnail: response[i].thumbnail,
							image: response[i].image,
							is_expanded_by: (response[i].is_expanded_by)? response[i].is_expanded_by : null,
						};
			}
			return self.boardgames;
		});
	}

	// Search for players
	self.querySearchPlayers = function (query) {
		var query = query.toLowerCase();
		if (query != ""){
			self.endAt = query.substring(0, query.length-1) + 
						Utils.changeLetter(query.substring(query.length-1, query.length-0))
		}

		return Api.users(query, 20, "search_username", self.endAt, "").$loaded().then(function(response){
			self.users = [];
			for (i=0; i<response.length; i++){
				if(response[i].search_username.indexOf(query.toLowerCase()) !== -1){
					self.users[i] = 
						{
							uid: response[i].$id,
							username: response[i].username,
							image: response[i].image,
							points: 0,
						};
				}
			}
			return self.users;
		});
	}

	this.goTo = function(tab){
		self.currentTab=tab;
		if(tab == 3){
			self.cleanMatch(self.teams);
		}
	}

	this.selectBoardgame= function() {
		//if a boardgame is selected
		if(self.selectedValues.boardgame!=null){
			//get the template relative to the game
			templates = Api.templates(self.selectedValues.boardgame.bggId);
			templates.$loaded().then(
				function(response){
					if(response.length > 0){
						self.templates = response;
						for(i=0;i<self.templates.length;i++)
							self.templates[i].visible = false;
					}
					else{
						self.templates = [];
					}

					self.goTo(1);
					//self.getUsers();
				},
				function errorCallback(response) {
					console.log(response);
				}
			);
		}
		else{			
			$rootScope.showToast("Select a boardgame");
		}
	}

	this.selectTemplate = function(template){
		delete  template["$id"]
		delete  template["$priority"]

		self.selectedValues.template = angular.fromJson(angular.toJson(template));
		for(team in self.selectedValues.template.teams){
			self.selectedValues.teams[self.selectedValues.template.teams[team].name[$rootScope.lang]] = {};
			self.selectedValues.teams[self.selectedValues.template.teams[team].name[$rootScope.lang]]["image"] = self.selectedValues.template.teams[team]["image"];
			self.selectedValues.teams[self.selectedValues.template.teams[team].name[$rootScope.lang]]["points"] = 0;
			self.selectedValues.teams[self.selectedValues.template.teams[team].name[$rootScope.lang]]["players"] = {};
			self.teams[self.selectedValues.template.teams[team].name[$rootScope.lang]] = [];
		}
		self.goTo(2);
	}

	//Post function
	this.postMatch=function(){
		//if some player are selected
		if(self.selectedValues.players!={}){
			//post match
			self.selectedValues.time = self.selectedValues.time.getTime();
			date = new Date();
			time = date.getTime();
			self.selectedValues.inserted_at = self.selectedValues.time;

			simpleObject = {};
			angular.copy(self.selectedValues, simpleObject);
			delete simpleObject["boardgame"];
			delete simpleObject["plays"];
			Api.matchpost(self.selectedValues, simpleObject).$loaded()
			.then(function(response){
					if(self.selectedValues.template.playersOrganization == "team based"){
						for(team in self.selectedValues.teams){
							if(self.teams[team].length > 0 || team == "The game"){
								play = self.preparePlay(team);
								play_post = Api.playpost(response.$id, play);
							}
						}
					}
					else{
						for(player in self.selectedValues.players){
							play = self.preparePlay(player);
							play_post = Api.playpost(response.$id, play);
						}
					}
					$rootScope.showToast("Match succesfully registered!");
					$mdDialog.hide();
					$location.path("matches/"+response.$id);
				}, 
				function errorCallback(response) {
					console.log(response);
				}
			);
		}
		else{
			$rootScope.showToast("Select at least one player");
		}
	}

	this.preparePlay = function(player){
		play = {}
		play["user"] = player;
		play["round"] = 1;
		if(self.selectedValues.template.howToScore == "win/lose"){
			play["round_winner"] = false;
		}
		else{
			play["detailed_points"] = {};
			play["points"] = 0;

			for(j = 0; j< self.selectedValues.template.scoring_fields.length; j++){
				scoring_field = self.selectedValues.template.scoring_fields[j];
				play["detailed_points"][j] = scoring_field;
				play["detailed_points"][j]["points"] = 0;
			}
		}
		return play;
	}

	this.setVisible = function(pk){
		self.templates[pk].visible = !self.templates[pk].visible;
	}

	this.togglePlayer = function(act, user, team, index){
		if(user != undefined){
			if(act == "select"){
				self.selectedValues.players[""+user.uid] = user;
				self.players.push(user);
				self.selectedPlayer = "";
			}
			else if(act == "move"){
				self.teams[team].splice(index, 1);
			}
			else if(act == "assign"){
				self.players.splice(index, 1);
			}
			else if(act == "delete_from_team"){
				self.teams[team].splice(index, 1);
				delete self.selectedValues.players[""+user.uid];
			}
			else{
				delete self.selectedValues.players[""+user.uid];
				self.players.splice(index, 1);
			}
		}
	}

	this.back = function(){
		self.currentTab--;
	}

	this.dismiss = function(){
		$mdDialog.hide();
	}

	this.showExpansions = function(boardgame){
		if(boardgame != undefined){
			self.expansions = boardgame.expansions;
		}
	}

	this.toggleExp = function(pk){
		i = self.selectedValues.expansions.indexOf(pk);
		if(i < 0)
			self.selectedValues.expansions.push(pk);
		else
			self.selectedValues.expansions.splice(i, 1);
	}

	this.isExpansionSelected = function(pk){
		i = self.selectedValues.expansions.indexOf(pk);
		return i >= 0;
	}

	this.updateVote = function(template, add, remove, user){
		
		if(template[add]){
			if(template[add][user])
				delete template[add][user];
			else
				template[add][user] = true;
		}
		else{
			template[add] = {}
			template[add][user] = true;
		}

		if(template[remove]){
			if(template[remove][user])
				delete template[remove][user];
		}
		simpleTemplate = {};
		angular.copy(template, simpleTemplate);
		delete simpleTemplate.$id;
		delete simpleTemplate.$$hashKey;
		delete simpleTemplate.$priority;
		uTemplate = Api.templateput(self.selectedValues.boardgame.bggId, template.$id, simpleTemplate, $rootScope.user.uid);
	}

	this.addTemplate = function(){
		$mdDialog.hide();
		$rootScope.goTo('templates/')
	}

	this.drop = function(ev){
		alert("dop");
	}

	this.cleanMatch = function(teams_object){
		for(te in self.selectedValues.template.teams)
			delete self.selectedValues.template.teams[te].$$hashKey;
		//delete self.selectedValues.template.teams;
		for(pl in self.selectedValues.players)
			delete self.selectedValues.players[pl].$$hashKey;

		for(te in teams_object){
			for(player of teams_object[te]){
				self.selectedValues.teams[te]["players"][player.uid] = player;
				delete self.selectedValues.teams[te]["players"][player.uid].$$hashKey;
			}
		}
	}

});