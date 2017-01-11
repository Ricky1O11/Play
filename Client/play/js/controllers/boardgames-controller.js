angular.module("play").controller('boardgamesController', function(Api, $routeParams) {
	this.params=$routeParams;
	this.boardgame={};
	controller=this;
	Api.boardgames(controller.params.id).success(function(data){
		controller.boardgame=data[0];
	});
	
});