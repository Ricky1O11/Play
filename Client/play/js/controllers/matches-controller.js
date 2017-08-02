//controller for the list of boardgames
angular.module("play").controller('matchesController', function(Api, Utils, $rootScope, $scope,currentAuth) {
	this.matches=[]; //container of the list of boardgames
	this.orderingField="-name"; //ordering field, selectable by the user
	this.loaded=true;
	this.toggleFavourite = Utils.toggleFavourite;
	controller=this;
	//api call to the list of boardgames
	Api.matches(currentAuth.uid).$loaded().then(function(data){
		controller.games=data;
		for(i = 0; i< controller.games.length; i++){
			controller.games[i].visible = false;
			controller.games[i].lastMatchTime = 0;
			for(match in controller.games[i].matches)
				controller.games[i].lastMatchTime = Math.max(controller.games[i].lastMatchTime, controller.games[i].matches[match].time);
		}
		controller.loaded = true;
	});
	
	//create ordered list of numbers
	this.range = function(a, b, step) {
		step = step || 1;
		var input = [];
		if(a>b){
		  for (var i = a; i >= b; i -= step) {
			input.push(i);
		  }
		}
		else{
		  for (var i = a; i <= b; i += step) {
			input.push(i);
		  }
		}
		return input;
	};
	
	//set the ordering field selected by the user
	this.setOrderingField = function(field) {
		controller.orderingField = field;
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.orderingField;
	}

	this.setVisible = function(id){
		for(i = 0; i<controller.games.length; i++){
			if(controller.games[i].$id == id){
				controller.games[i].visible = !controller.games[i].visible;
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