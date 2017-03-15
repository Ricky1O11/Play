//controller for the list of favourites boardgames
angular.module("play").controller('userController', function(Api, $routeParams, $rootScope, $scope) {
	this.params=$routeParams;
	this.user = {};
	this.friends = [];
	//hold the number of favourites for the current user
	this.favourites = [];
	//hold the number of matches played by the current user
	this.recents = [];

	this.infoChanged = false;
	this.settingsChanged = false;

	controller = this;
	controllerSidebar=this;
	Api.user(controller.params.id).then(function(response){
		controller.user = response.data
		controller.user.old_username = controller.user.username;
		controller.user.old_first_name = controller.user.first_name;
		controller.user.old_last_name = controller.user.last_name;
		controller.user.old_email = controller.user.email;
		console.log(controller.user);
	}, function errorCallback(response){
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

	this.setInfoChanged = function(){
		controller.infoChanged = true;
	}
	this.setSettingsChanged = function(){
		controller.settingsChanged = true;
	}

	this.addFriend = function(){
		rowToAdd = {
			'user1' : $rootScope.user_pk,
			'user2' : controller.user.pk
		}
		Api.friendspost(rowToAdd).then(function(response){
			controller.user.friendship = response.data.pk;
			$rootScope.showToast("Good job! You have a new friend!");
		}, function errorCallback(response){
			console.log(response);
		});
	}

	this.removeFriend = function(){
		Api.frienddelete(controller.user.friendship).then(function(response){
			controller.user.friendship = 0;
			$rootScope.showToast("What a pity! You lose a companion");
		}, function errorCallback(response){
			console.log(response);
		});
	}
});