//controller for the single designer page
angular.module("play").controller('designerController', function(Api, $routeParams, $scope, Utils) {
	//read the requested boardgame'id
	this.toggleFavourite = Utils.toggleFavourite;
	
	this.params=$routeParams;
	this.designer = []
	controller=this;
	controller.designer = Api.designer(controller.params.id);
});