 //controller for the popup dialog used to insert a new match
angular.module("play").controller('matchesDialogController', function($scope, Api, $rootScope, $mdDialog, $location, user_pk) {

	// list of `state` value/display objects
	self=this;
	self.user_pk = user_pk;
	self.currentTab=0 //holds the current tab id
	self.title= "Add Match"; //sets the tab title according to its id
	
	self.selectedValues={}; //dictionary that holds the values inserted by the user (time, location, game title, etc)
	self.selectedValues.players=[]; //list that holds the list of player playing the inserted match
	self.selectedValues.templates=[]; //list that holds the list of templates available in the db
	self.selectedValues.dictionary=[]; //list that holds the list of templates available in the db
	self.selectedValues.matchId = 0; //will contain the id of the inserted match
	self.selectedValues.expansions = []; //will contain the id of the selected expansions
	
	self.postValues={}; //dictionary that holds the values inserted by the user, in a format suitable to be posted to the server
	self.postValues.match={};
	self.postValues.expansions=[];
	self.postValues.plays=[];
	self.postValues.templates=[];
	self.postValues.scoringFields=[];
	self.postValues.dictionary = [];
	self.postValues.dp=[];
	
	
	self.boardgames=[]; //list of boardgames to display in the dropdown menu
	self.expansions = [];
	
	self.users=[];  //list of users to display in the dropdown menu
	self.nplayers=1; //holds the selected amount of players

	self.dictionary=[];  //list of users to display in the dropdown menu
	self.nwords=1; //holds the selected amount of players

	self.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.
	self.playerSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.
	self.dictionarySearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.
	self.points=[]; //holds the values for the corresponding scoring field

	self.adding = false;
	self.selecting = false;
	self.saving = false;

	self.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};
	
	//api call to the list of users
	Api.users().success(function(data){
		for (i=0; i<data.length; i++){
			if(data[i].pk != user_pk){
				self.users.push({display:data[i].username, friendship:data[i].friendship, value:data[i].username.toLowerCase(), id:data[i].pk, img:data[i].profile_details.imgimg})
			}
			else{
				 self.selectedValues.players[0] = {display:data[i].username, friendship:data[i].friendship, value:data[i].username.toLowerCase(), id:data[i].pk, img:data[i].profile_details.img};
				 self.playerSearchText[0] = data[i].username;
			}
		}
	});

	Api.dictionary().success(function(data){
		for (i=0; i<data.length; i++){
			self.dictionary[i]={display:data[i].word, value:data[i].word.toLowerCase(), id:data[i].pk}
		}
	});

	//Search for boardagames
	self.querySearchBoardgames = function (query) {
		return Api.boadgames(0, 100, "title", query).then(function(response){
			self.boardgames = [];
			for (i=0; i<response.data.length; i++){
				if(response.data[i].expands.length == 0)
					self.boardgames.push({display:response.data[i].title, value:response.data[i].title.toLowerCase(), id:response.data[i].pk, thumbnail:response.data[i].thumbnail, expansions:response.data[i].expansions})
			}
			return self.boardgames;
		});
	}

	//Search for users
	self.querySearchPlayers = function (query) {
		returned = [];
		if(query){
			results = self.users.filter(createFilterFor(query));
		}
		else{
			results= self.users;
		}
		for(i=0;i<results.length;i++){
			if(!containsObject(results[i], self.selectedValues.players)){
				returned.push(results[i]);
			}
		}
		return returned;
	}

	//Search for users
	self.querySearchWord = function (query) {
		if(query){
			results = self.dictionary.filter(createFilterFor(query));
		}
		else{
			results= self.dictionary;
		}
		return results;
	}

	/**
	 * Create filter function for a query string
	 */
	function createFilterFor(query) {
	  var lowercaseQuery = angular.lowercase(query);
	  return function filterFn(state) {
		return (state.value.indexOf(lowercaseQuery) === 0);
	  };
	}


	this.storeMatchInfo= function() {
		//if a boardgame is selected
		if(self.selectedValues.boardgame!=null){
			//get its id
			self.postValues.match.boardgame=self.selectedValues.boardgame.id;

			//get the template relative to the game
			Api.templates(self.selectedValues.boardgame.id).success(function(data){
				self.selectedValues.templates = data;
				for(i=0;i<self.selectedValues.templates.length;i++)
					self.selectedValues.templates[i].visible = false;
			});

			if(self.selectedValues.time!=null){
				self.postValues.match.time=self.selectedValues.time;
			}
			if(self.selectedValues.location!=null && self.selectedValues.location.replace(/\s/g, '').length){
				self.postValues.match.location=self.selectedValues.location;
			}
			if(self.selectedValues.name!=null){
				self.postValues.match.name=self.selectedValues.name;
			}
			self.goTo(1);
		}
		else{			
			$rootScope.showToast("Select a boardgame");
		}
	}


	this.goTo = function(tab){
			self.currentTab=tab;
			switch(self.currentTab){
				case 0: {
					self.title= "Add match";
					break;
				}
				case 1: {
					self.title= "Add players";
					break;
				}
				case 2: {
					self.title= "Select template";
					break;
				}
				case 3: {
					self.title= "Add scoring fields";
					break;
				}
			}
	}


	this.addTemplate = function(wantToAdd){
		if(!self.adding){
			self.adding = true;
			if(wantToAdd){
				self.goTo(3);
			}
			else{
				self.selectedValues.dictionary[0] = self.dictionary[0];
				self.postMatch("postTemplate");
			}
		}
	}

	this.selectTemplate = function(template){
		if(!self.selecting){
			self.selecting = true;
			self.selectedValues.scoringFields = template.scoringField_details;
			self.postMatch("selectTemplate");
		}
	}

	this.createTemplate = function(){
		if(!self.saving){
			self.saving = true;
			self.postMatch("createTemplate");
		}
	}

	//Post function
	this.postMatch=function(step){
		//if some player are selected
		if(self.selectedValues.players!=[]){
			//post match
			Api.matchpost(self.postValues.match).then(
					function(response){
						//get the id of the new match
						self.selectedValues.matchId = response.data.pk;
						//for each player
						for (i=0; i<self.selectedValues.expansions.length; i++){
							if(self.selectedValues.expansions[i] != null){
								//prepare the "expansion" row to be inserted in the play table
								row={match:self.selectedValues.matchId, boardgame:self.selectedValues.expansions[i]};
								self.postValues.expansions.push(row);
							}
						}
						self.postExpansion(step);
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

	//Post function
	this.postExpansion=function(step){
		//if some player are selected
		if(self.postValues.expansions!=[]){
			//post match
			Api.expansionpost(self.postValues.expansions).then(
					function(response){
						//for each player
						for (i=0; i<self.selectedValues.players.length; i++){
							if(self.selectedValues.players[i] != null){
								//prepare the "play" row to be inserted in the play table
								row={match:self.selectedValues.matchId, user:self.selectedValues.players[i].id};
								self.postValues.plays.push(row);
							}
						}
						self.postPlay(step);
					}, 
					function errorCallback(response) {
						console.log(response);
					}
			);
		}
		else{
			for (i=0; i<self.selectedValues.players.length; i++){
				if(self.selectedValues.players[i] != null){
					//prepare the "play" row to be inserted in the play table
					row={match:self.selectedValues.matchId, user:self.selectedValues.players[i].id};
					self.postValues.plays.push(row);
				}
			}
			self.postPlay(step);
		}
	}

	this.postPlay = function(step){
		//post play
		Api.playpost(self.postValues.plays).then(
			function(response){
				//get the list of posted plays
				self.selectedValues.play = response.data;
				if(step == "selectTemplate"){
					self.postDetailedPoints();
				}
				else if(step == "postTemplate"){
					self.postTemplate();
				}
				else if(step == "createTemplate"){
					self.postWord();
				}
			},
			function errorCallback(response){
			}
		); 
	}

	this.postTemplate = function(){
		//prepare the "template" row to be inserted in the templates table
		row={	
				boardgame:self.postValues.match.boardgame,
				hasExpansions: (self.selectedValues.expansions.length > 0)
			};
		self.postValues.templates.push(row);
		
		//post template
		Api.templatespost(self.postValues.templates).then(
			function(response){
				self.selectedValues.templates = response.data[0];
				self.postScoringFields();
			},
			function errorCallback(response){
			}
		);
		
	}

	this.postScoringFields = function(){
		//clean selectedValues array removing all null entries
		self.selectedValues.dictionary = self.selectedValues.dictionary.filter(function(n){return n != null});
		for (i=0; i<self.selectedValues.dictionary.length; i++){
			//prepare the "template" row to be inserted in the templates table
			row={	
					template:self.selectedValues.templates.pk,
					word: self.selectedValues.dictionary[i].id,
					bonus: self.points[i]
				};
			self.postValues.scoringFields.push(row);
		}
		//post template
		Api.scoringfieldspost(self.postValues.scoringFields).then(
			function(response){
				self.selectedValues.scoringFields = response.data;
				self.postDetailedPoints();
			},
			function errorCallback(response){
			}
		);
	}

	this.postWord = function(){
		for (i=0; i<self.dictionarySearchText.length; i++){
			if( self.selectedValues.dictionary[i] == null){
				row={
					word:self.dictionarySearchText[i],
					description:""
				};
				self.postValues.dictionary.push(row);
			}
		}
		if(self.postValues.dictionary.length>0){
			Api.dictionarypost(self.postValues.dictionary).then(
				function(response){
					for (j=0; j<response.data.length; j++){
						row = {display: response.data[j].word, value: response.data[j].word, id: response.data[j].pk}
						self.selectedValues.dictionary.push(row);
					}
					self.postTemplate();
				},
				function errorCallback(response){
				}
			);
		}
		else{
			self.postTemplate();
		}
	}

	this.postDetailedPoints = function(){
		for (i=0; i<self.selectedValues.play.length; i++){	
			//get the current play id
			self.selectedValues.playId = self.selectedValues.play[i].pk;
			//for each template entry
			for (j=0; j<self.selectedValues.scoringFields.length; j++){
				//get its id and prepare the "detailedPoints" row to be inserted in the detailedPoints table
				row = {}
				row.play = self.selectedValues.playId;
				row.scoringField = self.selectedValues.scoringFields[j].pk;
				row.detailed_points = 0;
				self.postValues.dp.push(row);
			}
		}

		//post detailedPoints
		Api.dpPost(self.postValues.dp).then(
			function(response){
				//if successfull, hide the dialog and prompt a message
				$rootScope.showToast("Match succesfully registered!");
				$mdDialog.hide();
				$location.path("matches/"+self.selectedValues.matchId);
			}, 
			function errorCallback(response){
			}
		);
	}


	this.setVisible = function(pk){
		for(i=0;i<self.selectedValues.templates.length;i++){
			if(self.selectedValues.templates[i].pk == pk)
				self.selectedValues.templates[i].visible = !self.selectedValues.templates[i].visible;
		}
	}

	function containsObject(obj, list) {
		var i;
		for (i = 0; i < list.length; i++) {
			if (list[i] === obj) {
				return true;
			}
		}
		return false;
	}

	this.togglePlayer = function(act, user, id){
		if(act == "select"){
			self.selectedValues.players.push(user);
			for(i=0;i<self.users.length;i++){
				if(self.users[i].id == id)
					self.users.splice(i, 1);
			}
		}
		else{
			self.selectedValues.players.splice(id, 1);
			self.users.push(user);
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

	this.updateVote = function(template, val){
		row = {vote : template.vote + val, boardgame: template.boardgame};
		Api.templateput(row, template.pk).then(function(response){
				template.vote = response.data.vote;
				console.log(response.data);
			}, function errorCallback(response){
				console.log(response.data);
			});		
	}
});