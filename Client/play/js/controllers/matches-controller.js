//controller for the list of boardgames
angular.module("play").controller('matchesController', function(Api, $scope) {
	this.matches=[]; //container of the list of boardgames
	this.orderingField="title"; //ordering field, selectable by the user
	this.loaded=false; //ordering field, selectable by the user
	controller=this;

	//watch the scope variable until it's loaded
	$scope.$watch('user_pk', function(newVal, oldVal){
		if(newVal != ""){
			//api call to the list of boardgames
			Api.matches($scope.user_pk).success(function(data){
				controller.games=data;
				for(i = 0; i< controller.games.length; i++){
					controller.games[i].visible = false;
					controller.games[i].lastMatchTime = controller.games[i].matches[controller.games[i].matches.length-1].time;
					if(controller.games[i].favourite.length > 0){
						controller.games[i].isFavourite = true;
					}
					else{
						controller.games[i].isFavourite = false;
					}
					controller.games[i].listId = i;
				}
				controller.loaded = true;
			});
		}
	});
	
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
	
	//set the ordering field selected by the user
	this.setOrderingField = function(field) {
		controller.orderingField = field;
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.orderingField;
	}

	this.setVisible = function(pk){
		for(i = 0; i<controller.games.length; i++){
			if(controller.games[i].pk == pk){
				controller.games[i].visible = !controller.games[i].visible;
			}
		}
	}

	this.toggleFavourites = function(favourite, boardgame, user, id){
        if(favourite.length > 0){
          Api.favouritedelete(favourite[0].pk).then(
                              function(response){
                                //if successfull, hide the dialog and prompt a message
                                console.log("Remove OK!");
                              }, function errorCallback(response){
                                console.log(response);
                              }
                            );
          	controller.games[id].favourite = [];
        	controller.games[id].isFavourite = false;
        }
        else{
            data = {'user': user, 'boardgame': boardgame};
            Api.favouritepost(data).then(
                              function(response){
                                //if successfull, hide the dialog and prompt a message
                              	console.log(response);
                                controller.games[id].favourite = [{'pk' : response.data.pk}];
                              }
            );
        	controller.games[id].isFavourite = true;
        }
    }
});