//controller for the list of favourites boardgames
angular.module("play").controller('userController', function(Api, Utils, $routeParams, $rootScope, $scope, currentAuth) {
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

	this.addFriend = Utils.addFriend;

	this.removeFriend = Utils.removeFriend;

	this.setVisible = function(id){
		for(i = 0; i<controller.common_matches.length; i++){
			if(controller.common_matches[i].$id == id){
				controller.common_matches[i].visible = !controller.common_matches[i].visible;
			}
		}
	}
});