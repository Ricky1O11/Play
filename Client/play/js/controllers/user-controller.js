//controller for the list of favourites boardgames
angular.module("play").controller('userController', function(Api, Utils, $routeParams, $rootScope, $scope) {
	this.params=$routeParams;
	this.user = {};
	//hold the number of favourites for the current user
	this.favourites = [];
	//hold the number of matches played by the current user
	this.recents = [];

	this.infoChanged = false;
	this.settingsChanged = false;

	controller = this;
	controllerSidebar=this;
	controller.user = Api.user(controller.params.id);
	controller.user.$loaded().then(function(response){
	controller.common_matches = [];
		controller.matches = Api.matches(response.$id);
		controller.matches.$loaded().then(function(response){
			for(g in response){
				controller.common_matches[g] = {}
				for(c in response[g]){
					if(c != "matches")
						controller.common_matches[g][c] = response[g][c];
					else{
						controller.common_matches[g].matches = {}
						for(m in response[g].matches){
							console.log(response[g].matches[m])
							if($rootScope.user.uid in response[g].matches[m].players)
								controller.common_matches[g].matches[m] = response[g].matches[m];
						}
					}
				}
			}
			console.log(controller.common_matches);
		});
	});

	this.addFriend = Utils.addFriend;

	this.removeFriend = Utils.removeFriend;

	this.setVisible = function(id){
		for(i = 0; i<$rootScope.games.length; i++){
			if($rootScope.games[i].$id == id){
				$rootScope.games[i].visible = !$rootScope.games[i].visible;
			}
		}
	}
});