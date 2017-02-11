 //controller for the popup dialog used to insert a new match
angular.module("play").controller('matchesDialogController', function($scope, Api, $mdDialog, $mdToast, $location, user_pk) {

	// list of `state` value/display objects
	self=this;
	self.user_pk = user_pk;
	self.currentTab=0 //holds the current tab id
	self.title=self.currentTab==0?"Add Match":"Add Players"; //sets the tab title according to its id
	
	self.selectedValues={}; //dictionary that holds the values inserted by the user (time, location, game title, etc)
	self.selectedValues.players=[]; //list that holds the list of player playing the inserted match
	self.selectedValues.templates=[]; //list that holds the list of templates available in the db
	self.selectedValues.dictionary=[]; //list that holds the list of templates available in the db
	self.selectedValues.matchId = 0; //will contain the id of the inserted match
	
	self.postValues={}; //dictionary that holds the values inserted by the user, in a format suitable to be posted to the server
	self.postValues.match={};
	self.postValues.plays=[];
	self.postValues.templates=[];
	self.postValues.scoringFields=[];
	self.postValues.dictionary = [];
	self.postValues.dp=[];
    
	
	self.boardgames=[]; //list of boardgames to display in the dropdown menu
	
	self.users=[];  //list of users to display in the dropdown menu
	self.nplayers=1; //holds the selected amount of players

	self.dictionary=[];  //list of users to display in the dropdown menu
	self.nwords=1; //holds the selected amount of players

	self.searchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.

	self.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};
	//api call to the list of boardgames
	Api.boadgames(self.user_pk).success(function(data){
		for (i=0; i<data.length; i++){
			self.boardgames[i]={display:data[i].title, value:data[i].title.toLowerCase(), id:data[i].pk}
		}
	});
	
	//api call to the list of users
	Api.users().success(function(data){
		for (i=0; i<data.length; i++){
			self.users[i]={display:data[i].username, value:data[i].username, id:data[i].pk}
		}
	});

	Api.dictionary().success(function(data){
		for (i=0; i<data.length; i++){
			self.dictionary[i]={display:data[i].word, value:data[i].word, id:data[i].pk}
		}
	});

    //Search for boardagames
    self.querySearchBoardgames = function (query) {
      var results = query ? self.boardgames.filter( createFilterFor(query) ) : self.boardgames;
        return results;
    }

	//Search for users
	self.querySearchPlayers = function (query) {
      var results = query ? self.users.filter( createFilterFor(query) ) : self.users;
        return results;
    }

    //Search for users
	self.querySearchWord = function (query) {
      var results = query 	? self.dictionary.filter( createFilterFor(query) ) 
      						: self.dictionary;
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
				if(self.selectedValues.location!=null && self.selectedValues.location.replace(/\s/g, '').length){
					self.postValues.match.location=self.selectedValues.location;
					self.postValues.match.name=self.selectedValues.name;
					self.searchText=[];
					self.currentTab=1;
				}
				else{
				self.showToast("Insert a location");
			}
			}
			else{
				self.showToast("Pick a date");
			}
		}
		else{			
			self.showToast("Select a boardgame");
		}
    }
	
	//Post function
	this.postMatchAndPlay=function(){
		//if some player are selected
		if(self.selectedValues.players!=[]){
			//post match
			Api.matchpost(self.postValues.match).then(
					function(response){
						//get the id of the new match
						self.selectedValues.matchId = response.data.pk;
						//for each player
						for (i=0; i<self.selectedValues.players.length; i++){
							//prepare the "play" row to be inserted in the play table
							row={match:self.selectedValues.matchId, user:self.selectedValues.players[i].id};
							self.postValues.plays.push(row);
						}
						//post play
						Api.playpost(self.postValues.plays).then(
							function(response){
								//get the list of posted plays
								self.selectedValues.play = response.data;
								self.currentTab=2;
							},
							function errorCallback(response){
							}
						);
					}, 
					function errorCallback(response) {
					}
			);
		}
		else{
			self.showToast("Select at least one player");
		}
	}

	this.addTemplate = function(wantToAdd){
		if(wantToAdd){
			self.currentTab=3;
			self.searchText = [];
		}
		else{
			self.selectedValues.dictionary[0] = self.dictionary[0];
			self.postTemplate();
		}
	}

	this.postWord = function(){
		for (i=0; i<self.searchText.length; i++){
			if( self.selectedValues.dictionary[i] == null){
				row={
					word:self.searchText[i],
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
						self.postTemplate();
					}
				},
				function errorCallback(response){
				}
			);
		}
		else{
			self.postTemplate();
		}
	}

	this.postTemplate = function(){
		//clean selectedValues array removing all null entries
		self.selectedValues.dictionary = self.selectedValues.dictionary.filter(function(n){return n != null});
		for (i=0; i<self.selectedValues.dictionary.length; i++){
			//prepare the "template" row to be inserted in the templates table
			row={	
					boardgame:self.postValues.match.boardgame
				};
			self.postValues.templates.push(row);
		}
		
		//post template
		Api.templatespost(self.postValues.templates).then(
			function(response){
				self.selectedValues.templates = response.data;
				self.postDetailedPoints();
			},
			function errorCallback(response){
				console.log(response);
			}
		);
	}

	this.postDetailedPoints = function(){
		for (i=0; i<self.selectedValues.play.length; i++){	
			//get the current play id
			self.selectedValues.playId = self.selectedValues.play[i].pk;
			//for each template entry
			for (j=0; j<self.selectedValues.templates.length; j++){
				//get its id and prepare the "detailedPoints" row to be inserted in the detailedPoints table
				row = {}
				row.play = self.selectedValues.playId;
				row.template = self.selectedValues.templates[j].pk;
				row.detailed_points = 0;
				self.postValues.dp.push(row);
			}
		}
		//post detailedPoints
		Api.dpPost(self.postValues.dp).then(
			function(response){
				//if successfull, hide the dialog and prompt a message
				self.showToast("Match succesfully registered!");
				$mdDialog.hide();
				$location.path("matches/"+self.selectedValues.matchId);
			}, 
			function errorCallback(response){
			}
		);
	}

	this.showToast=function(string){
		$mdToast.show(
			  $mdToast.simple()
				.textContent(string)
				.hideDelay(3000)
				.position('top right')
		);
	}

	this.setVisible = function(id){
		self.selectedValues.templates[id].visible = !self.selectedValues.templates[id].visible;
	}
});
 /*				if(self.selectedValues.templates.length > 0){
					self.postDetailedPoints();
				}
				else{
					self.showToast("This game doesn't have a template");
					self.currentTab=2;
				}*/