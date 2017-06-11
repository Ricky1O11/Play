//controller for the list of favourites boardgames
angular.module("play").controller('userController', function(Api, $routeParams, $rootScope, $scope) {
	this.params=$routeParams;
	this.user = {};
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
		console.log(controller.user)
		if(controller.user.profile_details.visibility_group == 0 || (controller.user.profile_details.visibility_group == 1 && controller.user.friendship > 0)){
			if(controller.user.profile_details.fav_setting){
				//api call to the list of favourites boardgames
				Api.favourites(controller.params.id).success(function(data){
					controller.favourites=data;
				});
			}

			if(controller.user.profile_details.rec_setting){
				//api call to the list of the played boardgames
				Api.recents(controller.params.id).success(function(data){
					controller.recents=data;
				});
			}
		}
	}, function errorCallback(response){
	});


	this.addFriend = function(){
		rowToAdd = [{
			'user1' : $rootScope.user_pk,
			'user2' : controller.user.pk
		}];
		Api.friendspost(rowToAdd).then(function(response){
			controller.user.friendship = response.data[0].pk;
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