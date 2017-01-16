//controller for the popup dialog used to insert a new match
angular.module("play").controller('matchesDialogController', function(Api, $mdDialog, $mdToast) {

	// list of `state` value/display objects
	self=this;
	
	self.currentTab=0 //holds the current tab id
	self.title=self.currentTab==0?"Add Match":"Add Players"; //sets the tab title according to its id
	
	self.selectedValues={}; //dictionary that holds the values inserted by the user (time, location, game title, etc)
	self.selectedValues.players=[]; //list that holds the list of player playing the inserted match
	self.selectedValues.matchId = 0; //will contain the id of the inserted match
	
	self.postValues={}; //dictionary that holds the values inserted by the user, in a format suitable to be posted to the server
	self.postValues.match={};
	self.postValues.plays=[];
    
	
	self.boardgames=[]; //list of boardgames to display in the dropdown menu
	
	self.users=[];  //list of users to display in the dropdown menu
	self.nplayers=1; //holds the selected amount of players

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
	Api.boadgames().success(function(data){
		for (i=0; i<data.length; i++){
			self.boardgames[i]={display:data[i].title, value:data[i].title.toLowerCase(), id:data[i].pk}
		}
	});
	
	//api call to the list of users
	Api.users().success(function(data){
		for (i=0; i<data.length; i++){
			self.users[i]={display:data[i].username, value:data[i].username.toLowerCase(), id:data[i].pk}
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
		if(self.selectedValues.boardgame!=null){
			self.postValues.match.boardgame=self.selectedValues.boardgame.id;
			if(self.selectedValues.time!=null){
				self.postValues.match.time=self.selectedValues.time;
				if(self.selectedValues.location!=null && self.selectedValues.location.replace(/\s/g, '').length){
					self.postValues.match.location=self.selectedValues.location;
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
	
	
	this.post=function(){
		if(self.selectedValues.players!=[]){
			Api.matchpost(self.postValues.match).then(
					function(response){
						self.selectedValues.matchId = response.data.pk;

							for (i=0; i<self.selectedValues.players.length; i++){
								row={match:self.selectedValues.matchId, user:self.selectedValues.players[i].id};
								self.postValues.plays.push(row);
							}
							Api.playpost(self.postValues.plays).then(
								function(response){
									self.showToast("Match succesfully registered!");
									$mdDialog.hide();
								},function errorCallback(response){
									console.log(response);
								}
							);
					}, 
					function errorCallback(response) {
						console.log(response);
					}
			);
		}
	}
	
	this.showToast=function(string){
		$mdToast.show(
			  $mdToast.simple()
				.textContent(string)
				.hideDelay(3000)
				.position('top right')
		);
	}
});