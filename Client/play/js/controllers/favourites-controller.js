//controller for the list of favourites boardgames
angular.module("play").controller('favouritesController', function(Api) {
	this.favourites = 0;
	
	//api call to the list of favourites boardgames
	controller=this;
	Api.favourites().success(function(data){
		controller.favourites=data;
		for(i=0;i<controller.favourites.length;i++){
			controller.favourites[i].listId = i;
		}
	});

	this.removeFavourite = function(favourite, id){
          Api.favouritedelete(favourite[0].pk).then(
	          function(response){
	            //if successfull, hide the dialog and prompt a message
	            console.log("Remove OK!");
				controller.favourites[id].splice(id, 1);
	          }, function errorCallback(response){
	            console.log(response);
	          }
	        );
    }

});