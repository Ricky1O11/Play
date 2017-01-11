angular.module("play").controller('homeController', function(Api, $mdDialog) {
	this.favourites = 0;
	this.recents = 0;
	
	controller=this;
	Api.favourites().success(function(data){
		if(data.length >=4)
			controller.favourites=data.slice(0, 4);
		else
			controller.favourites=data;
	});
	
	Api.recents().success(function(data){
		controller.recents=data;
	});
	
	this.lessThenFour = function(arg){
		if(controller[arg].length < 4)
			return true;
		else 
			return false;
	}
	
	this.inFavourites = function(title){
		for(f=0; f<controller.favourites.length; f++){
			if(title == controller.favourites[f].title)
				return true;
		}
		return false;
	}
	
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