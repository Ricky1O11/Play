angular.module("play").controller('sidebarController', function(Auth, $rootScope, $cookies, $window, Api, $mdDialog, $scope, $cookies, jwtHelper) {

	controllerSidebar=this;

	this.checkImg = function(){
		if($scope.img=="") 
			return false;
		else
			return true;
	}

	this.logout = function(){
		Auth.$signOut()
	}
});