angular.module("play").controller('matchesDialogController', function(Api, $mdDialog, $mdToast) {

	// list of `state` value/display objects
	self=this;
	
	self.currentTab=0
	self.title=self.currentTab==0?"Add Match":"Add Players";
	
	self.selectedValues={};
	self.selectedValues.players=[];
	self.selectedValues.matchId = 0;
	
	self.postValues={};
	self.postValues.match={};
	self.postValues.plays=[];
    
	
	self.boardgames=[];
	
	self.users=[];
	self.nplayers=1;
	self.searchText=[];
	self.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};
	
	
	Api.list().success(function(data){
		for (i=0; i<data.length; i++){
			self.boardgames[i]={display:data[i].title, value:data[i].title.toLowerCase(), id:data[i].pk}
		}
	});
	
	Api.users().success(function(data){
		for (i=0; i<data.length; i++){
			self.users[i]={display:data[i].username, value:data[i].username.toLowerCase(), id:data[i].pk}
		}
	});

    // ******************************
    // Internal methods
    // ******************************

    /**
     * Search for boardagames
     */
    self.querySearchBoardgames = function (query) {
      var results = query ? self.boardgames.filter( createFilterFor(query) ) : self.boardgames;
        return results;
    }
	/**
     * Search for players
     */
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