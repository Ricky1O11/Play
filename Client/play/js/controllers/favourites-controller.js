//controller for the list of favourites boardgames
angular.module("play").controller('favouritesController', function(Api, $scope) {
	this.favourites = 0;
	
	//api call to the list of favourites boardgames
	controller=this;
	Api.favourites().success(function(data){
		controller.favourites=data;
		for(i=0;i<controller.favourites.length;i++){
			controller.favourites[i].listId = i;
		}
	});
});