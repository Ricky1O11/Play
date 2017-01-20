//controller for the list of boardgames
angular.module("play").controller('matchesController', function(Api) {
	this.matches=[]; //container of the list of boardgames
	this.orderingField="-location"; //ordering field, selectable by the user
	
	controller=this;

	//api call to the list of boardgames
	Api.matches().success(function(data){
		controller.matches=data;
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
});