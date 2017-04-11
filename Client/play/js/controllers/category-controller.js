//controller for the single designer page
angular.module("play").controller('categoryController', function(Api, $routeParams, $scope) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.designer = []
	controller=this;
	Api.category(controller.params.id).success(function(data){
		controller.category=data[0];
	});
});