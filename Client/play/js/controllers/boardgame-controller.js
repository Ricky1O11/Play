//controller for the single boardgame page
angular.module("play").controller('boardgameController', function(Api, Utils, $firebaseObject, $routeParams, $scope, $rootScope, $mdDialog,currentAuth) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.boardgame={};
	this.isFavourite = false; 

	this.toggleFavourite = Utils.toggleFavourite
	this.range = Utils.range;
	
	controller=this;

	//api call to get the single boardgame's details
	controller.boardgame = Api.boardgame(controller.params.id);
	controller.matches = Api.matches(currentAuth.uid, controller.params.id)

});