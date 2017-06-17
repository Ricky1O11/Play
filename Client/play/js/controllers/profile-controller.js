 //controller for user profile
angular.module("play").controller('profileController', function(Api, $rootScope, $scope, $routeParams) {
	this.user = {};
	this.friends = [];
	//hold the number of favourites for the current user
	this.favourites = [];
	//hold the number of matches played by the current user
	this.recents = [];

	this.infoChanged = false;
	this.settingsChanged = false;
	this.params=$routeParams;
	console.log(this.params)
	if(this.params){
		this.currentTab = this.params.id
	}
	else{
		this.currentTab = 0
	}
	controller = this;
	controllerSidebar=this;
	Api.user($scope.user_pk).then(function(response){
		controller.user = response.data;
		controller.user.old_username = controller.user.username;
		controller.user.old_first_name = controller.user.first_name;
		controller.user.old_last_name = controller.user.last_name;
		controller.user.old_email = controller.user.email;
		controller.user.profile_details.old_visibility_group = controller.user.profile_details.visibility_group;
		controller.user.profile_details.old_fav_setting = controller.user.profile_details.fav_setting;
		controller.user.profile_details.old_rec_setting = controller.user.profile_details.rec_setting;
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
		console.log(controller.friends)
	});

	//api call to the list of favourites boardgames
	Api.favourites("").success(function(data){
		//if(data.length >=4)
		//	controller.favourites=data.slice(0, 4);
		//else
			controller.favourites=data;
	});

	//api call to the list of the played boardgames
	Api.recents($scope.user_pk).success(function(data){
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

	this.saveInfo = function(){
		Api.userput($scope.user_pk, controller.user).then(function(response){
			controller.user.old_username = controller.user.username;
			controller.user.old_first_name = controller.user.first_name;
			controller.user.old_last_name = controller.user.last_name;
			controller.user.old_email = controller.user.email;
			controller.user.profile_details.old_visibility_group = controller.user.profile_details.visibility_group;
			controller.user.profile_details.old_fav_setting = controller.user.profile_details.fav_setting;
			controller.user.profile_details.old_rec_setting = controller.user.profile_details.rec_setting;
			controller.infoChanged = false;
			$rootScope.showToast("Great! Update successful!");
		}, function errorCallback(response){
		});
	}

	this.saveSettings = function(){
		Api.profileput($scope.user_pk, controller.user.profile_details).then(function(response){
			console.log(response);
			controller.user.profile_details.old_visibility_group = controller.user.profile_details.visibility_group;
			controller.user.profile_details.old_fav_setting = controller.user.profile_details.fav_setting;
			controller.user.profile_details.old_rec_setting = controller.user.profile_details.rec_setting;
			controller.settingsChanged = false;
			$rootScope.showToast("Great! Update successful!");
		}, function errorCallback(response){
			console.log(response);
		});
	}

	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
	$scope.series = ['Series A', 'Series B'];
	$scope.data = [
	  [65, 59, 80, 81, 56, 55, 40],
	  [28, 48, 40, 19, 86, 27, 90]
	];

});