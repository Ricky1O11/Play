//controller for the list of favourites boardgames
angular.module("play").controller('profileController', function(Api, $scope) {
	this.user = {};
	this.friends = [];
	//hold the number of favourites for the current user
	this.favourites = [];
	//hold the number of matches played by the current user
	this.recents = [];
	controller = this;
	controllerSidebar=this;
	Api.user($scope.user_pk).success(function(data){
		controller.user = data
		console.log(controller.user);
	});
	Api.friends().success(function(data){
		for(i = 0;i<data.length; i++){
			if(data[i].user1 != $scope.user_pk){
				controller.friends.push(data[i].user1_details);
			}
			else if(data[i].user2 != $scope.user_pk){
				controller.friends.push(data[i].user2_details);
			}
		}
		console.log(controller.friends);
	});

	//api call to the list of favourites boardgames
	Api.favourites().success(function(data){
		//if(data.length >=4)
		//	controller.favourites=data.slice(0, 4);
		//else
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
});