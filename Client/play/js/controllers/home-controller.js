//controller for the home page screen
angular.module("play").controller('homeController', function(Api, $mdDialog) {

	//hold the number of favourites for the current user
	this.favourites = 0;
	//hold the number of matches played by the current user
	this.recents = 0;
	
	controller=this;

	//api call to the list of favourites boardgames
	Api.favourites().success(function(data){
		if(data.length >=4)
			controller.favourites=data.slice(0, 4);
		else
			controller.favourites=data;
	});

	//api call to the list of the played boardgames
	Api.recents().success(function(data){
		controller.recents=data;
	});
	
	//are there less then 4 boardgames in the "arg" (favourites / recents) list?
	this.lessThenFour = function(arg){
		if(controller[arg].length < 4)
			return true;
		else 
			return false;
	}
	
	//is the "title" game a favourite for the current user?
	this.inFavourites = function(title){
		for(f=0; f<controller.favourites.length; f++){
			if(title == controller.favourites[f].title)
				return true;
		}
		return false;
	}
	
	//TODO useless??
	this.matchesPopup = function(ev) {
		$mdDialog.show({
		  controller: 'matchesDialogController',
		  controllerAs: 'mdCtrl',
		  templateUrl: 'templates/matchesdialog.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  clickOutsideToClose:true,
		  //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
	}

});