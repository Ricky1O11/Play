//controller for the single boardgame page
angular.module("play").controller('boardgameController', function(Api, $routeParams) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.boardgame={};
	
	controller=this;

	//api call to get the single boardgame's details
	Api.boardgame(controller.params.id).success(function(data){
		controller.boardgame=data[0];
		console.log(controller.boardgame.description);
	});

	this.isFavourite = function(favourite){
		if (favourite == 1) return true;
		else return false;
	}

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
	
});