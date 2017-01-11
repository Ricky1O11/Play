angular.module("play").controller('listController', function(Api) {
	this.boardgames=[];
	this.orderingField="-average";
	
	controller=this;
	Api.list().success(function(data){
		controller.boardgames=data;
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
	
	this.setOrderingField = function(field) {
		controller.orderingField = field;
	}
	
	this.getOrderingField= function(){
		return controller.orderingField;
	}
});