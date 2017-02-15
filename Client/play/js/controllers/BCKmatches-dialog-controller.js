 //controller for the popup dialog used to insert a new match
angular.module("play").controller('matchesDialogController', function($scope, Api, $rootScope, $mdDialog, $location, user_pk) {

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

	self.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.
	self.playerSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.
	self.dictionarySearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.

	self.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};
	//api call to the list of boardgames
	Api.boadgames().success(function(data){
		for (i=0; i<data.length; i++){
			self.boardgames[i]={display:data[i].title, value:data[i].title.toLowerCase(), id:data[i].pk}
		}
	});
	
	//api call to the list of users
	Api.users().success(function(data){
		for (i=0; i<data.length; i++){
			if(data[i].pk != 2){
				self.users.push({display:data[i].username, value:data[i].username, id:data[i].pk})
			}
			else{
				 self.selectedValues.players[0] = {display:data[i].username, value:data[i].username.toLowerCase(), id:data[i].pk};
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
    	if(query){
			results = self.boardgames.filter(createFilterFor(query));
		}
    	else{
      		results= self.boardgames;
      	}
      	return results;
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
			self.currentTab=1;
		}
		else{			
			$rootScope.showToast("Select a boardgame");
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
							if(self.selectedValues.players[i] != null){
								//prepare the "play" row to be inserted in the play table
								row={match:self.selectedValues.matchId, user:self.selectedValues.players[i].id};
								self.postValues.plays.push(row);
							}
						}
						//post play
						Api.playpost(self.postValues.plays).then(
							function(response){
								//get the list of posted plays
								self.selectedValues.play = response.data;
								self.currentTab=2;
							},
							function errorCallback(response){
								console.log(response);
							}
						); 
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

	this.addTemplate = function(wantToAdd){
		if(wantToAdd){
			self.currentTab=3;

		}
		else{
			self.selectedValues.dictionary[0] = self.dictionary[0];
			self.postTemplate();
		}
	}

	this.selectTemplate = function(template){
		self.selectedValues.scoringFields = template.scoringField_details;
		self.postDetailedPoints();
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




	this.postTemplate = function(){
		//prepare the "template" row to be inserted in the templates table
		row={	
				boardgame:self.postValues.match.boardgame
			};
		self.postValues.templates.push(row);
		
		//post template
		Api.templatespost(self.postValues.templates).then(
			function(response){
				self.selectedValues.templates = response.data[0];
				self.postScoringFields();
			},
			function errorCallback(response){
				console.log(response);
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
					word: self.selectedValues.dictionary[i].id
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
				console.log(response);
			}
		);
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
				console.log("row");
				console.log(row);
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




	this.setVisible = function(id){
		self.selectedValues.templates[id].visible = !self.selectedValues.templates[id].visible;
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

	this.back = function(){
		self.currentTab--;
	}
	this.dismiss = function(){
		$mdDialog.hide();
	}
});