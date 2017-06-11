//controller for the list of boardgames
angular.module("play").controller('matchesController', function(Api, $scope) {
	this.matches=[]; //container of the list of boardgames
	this.orderingField="-title"; //ordering field, selectable by the user
	this.loaded=false;
	controller=this;

	//api call to the list of boardgames
	Api.matches($scope.user_pk).success(function(data){
		controller.games=data;
		for(i = 0; i< controller.games.length; i++){
			controller.games[i].visible = false;
			controller.games[i].lastMatchTime = controller.games[i].matches[controller.games[i].matches.length-1].time;
			controller.games[i].isFavourite = (controller.games[i].favourite > 0);
			controller.games[i].listId = i;
		}
		controller.loaded = true;
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
        if(favourite > 0){
          Api.favouritedelete(favourite).then(
                              function(response){
                              }, function errorCallback(response){
                              }
                            );
          	controller.games[id].favourite = -1;
        	controller.games[id].isFavourite = false;
        }
        else{
            data = {'user': user, 'boardgame': boardgame};
            Api.favouritepost(data).then(
                              function(response){
                                controller.games[id].favourite = response.data.pk;
                              }
            );
        	controller.games[id].isFavourite = true;
        }
    }

    this.timeGreaterThanGame = function (game) {
    	var now = new Date();
    	for(i = 0; i< game.matches.length; i++){
			if(now < new Date(game.matches[i].time)){
				return true;
			}
    	}
    	return false;
	};

	this.timeGreaterThanMatch = function (match) {
    	var now = new Date();
		if(now < new Date(match.time)){
			return true;
		}
    	return false;
	}; 
});