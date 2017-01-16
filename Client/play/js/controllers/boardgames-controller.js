//controller for the list of boardgames
angular.module("play").controller('boardgamesController', function(Api) {
	this.boardgames=[]; //container of the list of boardgames
	this.orderingField="-average"; //ordering field, selectable by the user
	
	controller=this;

	//api call to the list of boardgames
	Api.boadgames().success(function(data){
		controller.boardgames=data;
	});

	//is the boardgame a favourite for the user?
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
	
	//set the ordering field selected by the user
	this.setOrderingField = function(field) {
		controller.orderingField = field;
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.orderingField;
	}
});