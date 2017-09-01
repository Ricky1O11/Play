//controller for the popup dialog used to insert a new match
angular.module("play").controller('matchesDialogController', function($scope, Utils, Api, $filter, $rootScope, $mdDialog, $location, user_pk, boardgame) {
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
	}; //dictionary that holds the values inserted by the user (time, location, game title, etc)


	if(boardgame != -1){
		self.selectedValues.boardgame = boardgame;
	}
	
	self.boardgames=[]; //list of boardgames to display in the dropdown menu
	self.expansions = [];
	self.users={};  //list of users to display in the dropdown menu
	self.templates=[]; //list that holds the list of templates available in the db
	

	self.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.

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


					if(simpleUser.uid != $rootScope.user.uid){
						self.users[simpleUser.uid] = simpleUser;
					}
					else{
						 self.selectedValues.players[""+simpleUser.uid] = simpleUser;
					}
				}
			});
		}
	}

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

	this.goTo = function(tab){
		self.currentTab=tab;
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
						console.log(self.templates);
						for(i=0;i<self.templates.length;i++)
							self.templates[i].visible = false;
					}
					else{
						self.templates = [];
					}

					self.goTo(1);
					self.getUsers();
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
		if(self.selectedValues.template.playersOrganization == "team based")
			self.goTo(3);
		else
			self.goTo(4);
	}

	//Post function
	this.postMatch=function(){
		//if some player are selected
		if(self.selectedValues.players!=[]){
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
					for(player in self.selectedValues.players){
						play = self.preparePlay(player);
						play_post = Api.playpost(response.$id, play);
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
		play["detailed_points"] = {};
		play["points"] = 0;

		for(j = 0; j< self.selectedValues.template.scoring_fields.length; j++){
			scoring_field = self.selectedValues.template.scoring_fields[j];
			play["detailed_points"][j] = scoring_field;
			play["detailed_points"][j]["points"] = 0;
		}
		return play;
	}

	this.setVisible = function(pk){
		console.log(templates[pk]);
		self.templates[pk].visible = !self.templates[pk].visible;
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
});