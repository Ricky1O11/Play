//controller for user profile
angular.module("play").controller('profileController', function(Api, Utils, $rootScope, $scope, $routeParams) {
	this.params=$routeParams;
	controller = this;
	if(this.params){
		controller.currT = this.params.id;
	}
	else{
		controller.currT = 0
	}
	controllerSidebar=this;
});