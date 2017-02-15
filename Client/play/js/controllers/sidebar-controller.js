angular.module("play").controller('sidebarController', function($scope, Api, $mdDialog, $scope, $cookies, jwtHelper) {
	$scope.img="";
	$scope.match_played=0;
	$scope.match_won=0;
	$scope.username="";
	$scope.user_pk=jwtHelper.decodeToken($cookies.get('tok')).user_id;
	
	controllerSidebar=this;
	Api.user($scope.user_pk).success(function(data){
		$scope.match_played = data.match_played;
		$scope.match_won = data.match_won;
		$scope.username = data.username;
		$scope.img = data.profile.img;
		$scope.user_pk = data.pk;
	});

	this.checkImg = function(){
		if($scope.img=="") 
			return false;
		else
			return true;
	}
});