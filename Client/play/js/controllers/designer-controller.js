//controller for the single designer page
angular.module("play").controller('designerController', function(Api, $routeParams, $scope) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.designer = []
	controller=this;
	Api.designer(controller.params.id).success(function(data){
		controller.designer=data[0];
	});
});