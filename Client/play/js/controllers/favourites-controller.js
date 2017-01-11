angular.module("play").controller('favouritesController', function(Api) {
	this.favourites = 0;
	
	controller=this;
	Api.favourites().success(function(data){
		controller.favourites=data;
	});

});