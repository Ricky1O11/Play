angular.module("play").controller('sidebarController', function($scope, Api, $mdDialog, $scope) {
	$scope.img="";
	$scope.match_played=0;
	$scope.match_won=0;
	$scope.username="";
	$scope.user_pk=2;
	
	controllerSidebar=this;
	Api.user(2).success(function(data){
		$scope.match_played = data.match_played;
		$scope.match_won = data.match_won;
		$scope.username = data.username;
		$scope.img = data.img;
		$scope.user_pk = data.pk;
	});

	this.checkImg = function(){
	
		console.log ($scope.img);
		if($scope.img=="") 
			return false;
		else
			return true;
	}
});