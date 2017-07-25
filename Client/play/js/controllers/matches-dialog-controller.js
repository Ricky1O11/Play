//controller for the popup dialog used to insert a new match
angular.module("play").controller('matchesDialogController', function($scope, Api, $rootScope, $mdDialog, $location, user_pk, boardgame) {
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

	if(boardgame != -1){
		self.selectedValues.boardgame = boardgame;
	}

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
	self.getUsers = function(){
		if(self.users.length == 0 && self.selectedValues.players.length == 0){
			Api.users().success(function(data){
				for (i=0; i<data.length; i++){
					if(data[i].pk != user_pk){
						self.users.push({display:data[i].username, friendship:data[i].friendship, value:data[i].username.toLowerCase(), id:data[i].pk, img:data[i].profile_details.imgimg})
					}
					else{
						 self.selectedValues.players[0] = {display:data[i].username, friendship:data[i].friendship, value:data[i].username.toLowerCase(), id:data[i].pk, img:data[i].profile_details.img};
					}
				}
			});
		}
	}

	//Search for boardagames
	self.querySearchBoardgames = function (query) {
		return Api.boadgames(0, 100, "title", query).then(function(response){
			self.boardgames = [];
			for (i=0; i<response.data.length; i++){
				if(response.data[i].expands.length == 0)
					self.boardgames.push({display:response.data[i].title, value:response.data[i].title.toLowerCase(), id:response.data[i].pk, thumbnail:response.data[i].thumbnail, img:response.data[i].img, expansions:response.data[i].expansions})
			}
			return self.boardgames;
		});
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

	this.goTo = function(tab){
		self.currentTab=tab;
	}

	this.selectBoardgame= function() {
		//if a boardgame is selected
		if(self.selectedValues.boardgame!=null){
			//get its id
			self.postValues.match.boardgame=self.selectedValues.boardgame.id;
			//get the template relative to the game
			Api.templates(self.selectedValues.boardgame.id).then(
				function(response){
					self.selectedValues.templates = response.data;
					if(self.selectedValues.templates.length == 0){
						self.postBasicTemplate();
					}
					
					for(i=0;i<self.selectedValues.templates.length;i++)
						self.selectedValues.templates[i].visible = false;
					console.log(self.selectedValues.templates);
					self.getUsers();
					self.goTo(1);
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
		self.selectedValues.scoringFields = template.scoringField_details;
		self.goTo(3);
	}

	//Post function
	this.postMatch=function(){
		if(self.selectedValues.time!=null){
			self.postValues.match.time=self.selectedValues.time;
		}
		if(self.selectedValues.location!=null && self.selectedValues.location.replace(/\s/g, '').length){
			self.postValues.match.location=self.selectedValues.location;
		}
		if(self.selectedValues.name!=null){
			self.postValues.match.name=self.selectedValues.name;
		}
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
						self.postExpansion();
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
	this.postExpansion=function(){
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
						self.postPlay();
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
			self.postPlay();
		}
	}

	this.postPlay = function(){
		//post play
		Api.playpost(self.postValues.plays).then(
			function(response){
				//get the list of posted plays
				self.selectedValues.play = response.data;
				self.postDetailedPoints();
			},
			function errorCallback(response){
			}
		); 
	}

	//post the detailed points to the server
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

		//call the server API
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



	this.postBasicTemplate = function(){
		//prepare the "template" row to be inserted in the templates table
		row={	
				boardgame:self.selectedValues.boardgame.id,
				hasExpansions: false
			};
		self.postValues.templates.push(row);
		
		//post template
		Api.templatespost(self.postValues.templates).then(
			function(response){
				self.selectedValues.templates = [response.data[0]];
				self.postScoringFields();
			},
			function errorCallback(response){
				console.log(response)
			}
		);
	}

	this.postScoringFields = function(){
		//prepare the "template" row to be inserted in the templates table
		row={	
				template:self.selectedValues.templates[0].pk,
				word: 1,
				bonus: 1
			};
		self.postValues.scoringFields.push(row);

		//post scoring field
		Api.scoringfieldspost(self.postValues.scoringFields).then(
			function(response){
				self.selectedValues.templates[0].scoringField_details = response.data;
				console.log(self.selectedValues.templates)
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

	this.containsObject = function(obj, list) {
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
		if(template.user_vote != 0){
			Api.templatevotes(template.pk, self.user_pk).then(function(response){
					Api.templatevotesdelete(response.data[0].pk).then(function(response){
						}, function errorCallback(response){
							console.log(response);
					});
				}, function errorCallback(response){
					console.log(response);
			});
		}

		row = [{vote : val, template: template.pk, user: self.user_pk}];
		Api.templatevotespost(row).then(function(response){
				template.votes = parseInt(template.votes)-parseInt(template.user_vote)+parseInt(response.data[0].vote);
				template.user_vote = response.data[0].vote;
			}, function errorCallback(response){
				console.log(response.data);
		});
	}
});