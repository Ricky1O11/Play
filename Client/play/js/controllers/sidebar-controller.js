angular.module("play").controller('sidebarController', function(Auth, $rootScope, $cookies, $window, Api, $mdDialog, $scope, $cookies, jwtHelper) {

	controllerSidebar=this;
	dbuser = Api.user($rootScope.user.uid);
	dbuser.$bindTo($rootScope, "user.profile_details");

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