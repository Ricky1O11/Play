angular.module("play").controller('sidebarController', function(Auth, $rootScope, $cookies, $window, Api, $mdDialog, $scope, $cookies, jwtHelper) {
	$scope.img="";
	$scope.match_played=0;
	$scope.match_won=0;
	$scope.username="";
	
	
	controllerSidebar=this;
	dbuser = Api.user($rootScope.user.uid);
	
	dbuser.$loaded().then(function(response){
		$rootScope.user.profile_details = {};
		$rootScope.user.profile_details.image = dbuser.image;
		$rootScope.user.profile_details.username = dbuser.username;
		console.log($rootScope.user);
	}).catch(function(error){
		console.log(error);
	})


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