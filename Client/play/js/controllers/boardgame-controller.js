//controller for the single boardgame page
angular.module("play").controller('boardgameController', function(Api, $routeParams, $scope) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.boardgame={};
	this.isFavourite = false;
	
	controller=this;
	//watch the scope variable until it's loaded
	$scope.$watch('user_pk', function(newVal, oldVal){
		console.log(oldVal);
		if(newVal != ""){
			//api call to get the single boardgame's details
			Api.boardgame(controller.params.id).success(function(data){
				controller.boardgame=data[0];
				if(controller.boardgame.favourite.length > 0){
					controller.isFavourite = true;
				}
			});
		}
	});
	
	this.toggleFavourites = function(favourite, boardgame, user){
        if(favourite.length > 0){
          Api.favouritedelete(favourite[0].pk).then(
                              function(response){
                                //if successfull, hide the dialog and prompt a message
                                console.log("Remove OK!");
                              }, function errorCallback(response){
                                console.log(response);
                              }
                            );
          	controller.boardgame.favourite = [];
        	controller.isFavourite = false;
        }
        else{
            data = {'user': user, 'boardgame': boardgame};
            Api.favouritepost(data).then(
                              function(response){
                                //if successfull, hide the dialog and prompt a message
                                controller.boardgame.favourite = [{'pk' : response.data.pk}];
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
});