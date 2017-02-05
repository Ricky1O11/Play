//controller for the list of boardgames
angular.module("play").controller('matchesController', function(Api) {
	this.matches=[]; //container of the list of boardgames
	this.orderingField="title"; //ordering field, selectable by the user
	this.loaded=false; //ordering field, selectable by the user
	controller=this;

	//api call to the list of boardgames
	Api.matches().success(function(data){
		controller.games=data;
		for(i = 0; i< controller.games.length; i++){
			controller.games[i].visible = false;
			controller.games[i].lastMatchTime = controller.games[i].matches[controller.games[i].matches.length-1].time;
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

	this.setVisible = function(pk){
		for(i = 0; i<controller.games.length; i++){
			if(controller.games[i].pk == pk){
				controller.games[i].visible = !controller.games[i].visible;
			}
		}
	}

	this.matchesSum = function(){
		sum = 0;
		for(i = 0; i<controller.games.length; i++){
			sum += controller.games[i].matches.length;
		}
		return sum;
	}

	//is the boardgame a favourite for the user?
	this.isFavourite = function(favourite){
		if (favourite == 1) return true;
		else return false;
	}
});