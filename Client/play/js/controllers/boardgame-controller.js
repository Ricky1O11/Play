//controller for the single boardgame page
angular.module("play").controller('boardgameController', function(Api, $firebaseObject, $routeParams, $scope, $rootScope, $mdDialog) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.boardgame={};
	this.isFavourite = false; 
	
	controller=this;

	//api call to get the single boardgame's details
	controller.boardgame = Api.boardgame(controller.params.id);

	this.toggleFavourites = function(boardgame){
		if("favourites" in $rootScope.user["profile_details"]){
			if(boardgame.bggId in $rootScope.user["profile_details"]["favourites"]){
				delete $rootScope.user["profile_details"]["favourites"][boardgame.bggId];
			}
			else{
				$rootScope.user["profile_details"]["favourites"][boardgame.bggId] = {
					"name": boardgame.name,
					"image": boardgame.image,
					"bggId": boardgame.bggId
				}
			}
		}
		else{
			$rootScope.user["profile_details"]["favourites"] = {};
			$rootScope.user["profile_details"]["favourites"][boardgame.bggId] = {
					"name": boardgame.name,
					"image": boardgame.image,
					"bggId": boardgame.bggId
				}
		}
    }

	//create ordered list of numbers
	this.range = function(a, b, step) {
		step = step || 1;
		var input = [];
		if(a>b){
		  for (var i = a; i >= b; i -= step) {
			input.push(i);
		  }
		}
		else{
		  for (var i = a; i <= b; i += step) {
			input.push(i);
		  }
		}
		return input;
	};

	this.showImage = function(ev, url) {
				$mdDialog.show({
					locals:{url : url},
					controller: 'imageDialogController',
					controllerAs: 'iCtrl',
					templateUrl: 'templates/imagedialog.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					scope:$rootScope,
					preserveScope:true,	
					clickOutsideToClose:true,
					fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
				})	
			}
});