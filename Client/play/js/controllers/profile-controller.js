  //controller for user profile
angular.module("play").controller('profileController', function(Api, $rootScope, $scope, $routeParams) {
	this.user = {};
	this.friends = [];
	//hold the number of favourites for the current user
	this.favourites = [];
	//hold the number of matches played by the current user
	this.recents = [];

	this.infoChanged = false;
	this.settingsChanged = false;
	this.params=$routeParams;

	console.log(this.params)
	if(this.params){
		this.currentTab = this.params.id
	}
	else{
		this.currentTab = 0
	}
	controller = this;
	controllerSidebar=this;

	//are there less then 4 boardgames in the "arg" (favourites / recents) list?
	this.lessThenFour = function(arg){
		if(controller[arg].length < 4)
			return true;
		else 
			return false;
	}
	
	//is the "title" game a favourite for the current user?
	this.inFavourites = function(title){
		for(f=0; f<controller.favourites.length; f++){
			if(title == controller.favourites[f].title)
				return true;
		}
		return false;
	}

	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
	$scope.series = ['Series A', 'Series B'];
	$scope.data = [
	  [65, 59, 80, 81, 56, 55, 40],
	  [28, 48, 40, 19, 86, 27, 90]
	];
});