//controller for the list of boardgames
angular.module("play").controller('matchesController', function(Api, Utils, $rootScope, $scope,currentAuth) {
	
	console.log($rootScope.match);
	this.matches=[]; //container of the list of boardgames
	this.orderingField="-name"; //ordering field, selectable by the user
	this.loaded=true;
	this.toggleFavourite = Utils.toggleFavourite;
	controller=this;
	
	//create ordered list of numbers
	this.range = Utils.range;

	//set the ordering field selected by the user
	this.setOrderingField = function(field) {
		controller.orderingField = field;
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.orderingField;
	}

	this.setVisible = function(id){
		for(game in $rootScope.games){
			if($rootScope.games[game].bggId == id){
				$rootScope.games[game].visible = !$rootScope.games[game].visible;
			}
		}
	}

    this.timeGreaterThanGame = function (game) {
    	var now = new Date().getTime();
    	for(i in game.matches){
			if(now < game.matches[i].time){
				return true;
			}
    	}
    	return false;
	};

	this.timeGreaterThanMatch = function (match) {
    	var now = new Date().getTime();
		if(now < match.time){
			return true;
		}
    	return false;
	}; 
});