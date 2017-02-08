//controller for the list of boardgames
angular.module("play").controller('boardgamesController', function(Api, $scope) {
	this.boardgames=[]; //container of the list of boardgames
	this.orderingField="-average"; //ordering field, selectable by the user
	
	controller=this;
	//watch the scope variable until it's loaded
	$scope.$watch('user_pk', function(newVal, oldVal){
		if(newVal != ""){
			//api call to the list of boardgames
			Api.boadgames($scope.user_pk).success(function(data){
				controller.boardgames=data;
				for(i=0;i<controller.boardgames.length;i++){
					if(controller.boardgames[i].favourite.length > 0){
						controller.boardgames[i].isFavourite = true;
					}
					else{
						controller.boardgames[i].isFavourite = false;
					}
					controller.boardgames[i].listId = i;
				}
			});
		}
	});
	
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
			controller.boardgames[id].favourite = [];
			controller.boardgames[id].isFavourite = false;
		}
		else{
			data = {'user': user, 'boardgame': boardgame};
			Api.favouritepost(data).then(
							  function(response){
								//if successfull, hide the dialog and prompt a message
								console.log(response);
								controller.boardgames[id].favourite = [{'pk' : response.data.pk}];
							  }
			);
			controller.boardgames[id].isFavourite = true;
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
	
	//set the ordering field selected by the user
	this.setOrderingField = function(field) {
		controller.orderingField = field;
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.orderingField;
	}
});