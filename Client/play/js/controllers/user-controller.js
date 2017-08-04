//controller for the list of favourites boardgames
angular.module("play").controller('userController', function(Api, $routeParams, $rootScope, $scope) {
	this.params=$routeParams;
	this.user = {};
	//hold the number of favourites for the current user
	this.favourites = [];
	//hold the number of matches played by the current user
	this.recents = [];

	this.infoChanged = false;
	this.settingsChanged = false;

	controller = this;
	controllerSidebar=this;
	controller.user = Api.user(controller.params.id);


	this.addFriend = function(){
		Api.friendspost($rootScope.user, controller.user).then(function(response){
			$rootScope.showToast("Good job! You have a new friend!");
		}, function errorCallback(response){
			console.log(response);
		});
	}

	this.removeFriend = function(){
		Api.frienddelete($rootScope.user.uid, controller.user.$id).then(function(response){
			$rootScope.showToast("What a pity! You lose a companion");
		}, function errorCallback(response){
			console.log(response);
		});
	}
});