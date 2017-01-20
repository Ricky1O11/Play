//controller for the single boardgame page
angular.module("play").controller('boardgameController', function(Api, $routeParams) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.boardgame={};
	
	controller=this;

	//api call to get the single boardgame's details
	Api.boardgame(controller.params.id).success(function(data){
		controller.boardgame=data[0];
	});
	
});