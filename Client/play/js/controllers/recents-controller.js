angular.module("play").controller('recentsController', function($scope, Api) {
	this.recents = 0;
	
	controller=this;
	Api.recents().success(function(data){
		controller.recents=data;
	});

	this.isFavourite = function(favourite){
		if (favourite == 1) return true;
		else return false;
	}
});