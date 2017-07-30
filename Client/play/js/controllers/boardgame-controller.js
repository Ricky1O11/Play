//controller for the single boardgame page
angular.module("play").controller('boardgameController', function(Api, $firebaseObject, $routeParams, $scope, $rootScope, $mdDialog) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.boardgame={};
	this.isFavourite = false; 
	
	controller=this;

	//api call to get the single boardgame's details
	controller.boardgame = Api.boardgame(controller.params.id);

	controller.boardgame.$loaded()
	  .then(function() {
	    if(controller.boardgame.favourite > 0){
			controller.isFavourite = true;
		}
		console.log(controller.boardgame.playingtime);
	  })
	  .catch(function(err) {
	    console.error(err);
	  });

	this.toggleFavourites = function(favourite, boardgame, user){
        if(favourite > 0){
          Api.favouritedelete(favourite).then(
                              function(response){
                                //if successfull, hide the dialog and prompt a message
                              }, function errorCallback(response){
                              }
                            );
          	controller.boardgame.favourite = -1;
        	controller.isFavourite = false;
        }
        else{
            data = {'user': user, 'boardgame': boardgame};
            Api.favouritepost(data).then(
                              function(response){
                                //if successfull, hide the dialog and prompt a message
                                controller.boardgame.favourite = response.data.pk;
                              }, function errorCallback(response){
                              }
                            );
        	controller.isFavourite = true;
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