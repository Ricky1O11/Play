angular.module("play").controller('sidebarController', function(Auth, $rootScope, $cookies, $window, Api, $mdDialog, $scope, $cookies, jwtHelper) {

	controllerSidebar=this;
	dbuser = Api.user($rootScope.user.uid);
	dbuser[0].$bindTo($rootScope, "user.profile_details");
	dbuser[1].$bindTo($rootScope, "user.matches");

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