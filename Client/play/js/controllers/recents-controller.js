angular.module("play").controller('recentsController', function($scope, Api) {
	this.recents = 0;
	
	controller=this;

	//watch the scope variable until it's loaded
	$scope.$watch('user_pk', function(newVal, oldVal){
		if(newVal != ""){
			Api.recents().success(function(data){
				controller.recents=data;
			});
		}
	});
	
	this.isFavourite = function(favourite){
		if (favourite == 1) return true;
		else return false;
	}
});