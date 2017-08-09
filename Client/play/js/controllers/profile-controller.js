//controller for user profile
angular.module("play").controller('profileController', function(Api, $rootScope, $scope, $routeParams) {
	this.params=$routeParams;
	controller = this;
	console.log(this.params)
	if(this.params){
		controller.currT = this.params.id;
	}
	else{
		controller.currT = 0
	}
	controllerSidebar=this;

	this.countMatchesWith = function(friend_id){
		match_played_with = 0;
		match_won_with = 0;
		for(game in $rootScope.games){
			
			for(match in $rootScope.games[game].matches){
				if(friend_id in $rootScope.games[game].matches[match].players){
					match_played_with++;
					if($rootScope.games[game].matches[match] && $rootScope.games[game].matches[match].winner == $rootScope.user.uid)
						match_won_with++;
				}
			}
		}
		return [match_won_with,match_played_with];
	}

	console.log($rootScope.user);

	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
	$scope.series = ['Series A', 'Series B'];
	$scope.data = [
	  [65, 59, 80, 81, 56, 55, 40],
	  [28, 48, 40, 19, 86, 27, 90]
	];
});