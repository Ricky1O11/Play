 //controller for the popup dialog used to insert a new match
angular.module("play").controller('friendsDialogController', function($scope, Api, $route, $rootScope, $mdDialog, $location, user_pk) {

	// list of `state` value/display objects
	self=this;
	self.user_pk = user_pk;
	self.currentTab=0 //holds the current tab id
	self.title= "Add Friends"; //sets the tab title according to its id
	
	self.friends=[]; //list that holds the list of player playing the inserted match
		
	self.users=[];  //list of users to display in the dropdown menu

	self.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};
	//api call to the list of users
	Api.users().$loaded().then(function(data){
		for (i=0; i<data.length; i++){
			if(data[i].$id != $rootScope.user.uid
				&& (!$rootScope.user.friends.outbound || !(data[i].$id in $rootScope.user.friends.outbound))
				&& (!$rootScope.user.friends.inbound || !(data[i].$id in $rootScope.user.friends.inbound))){
				self.users.push(data[i]);
			}
		}
	});

	this.saveFriends = function(){
		console.log("ok");
		for(i=0; i<self.friends.length;i++){

			Api.friendspost($rootScope.user, self.friends[i]).then(function(response){
				$rootScope.showToast("Good job! You have "+self.friends.length+" new friends!");
				$mdDialog.hide();
				$route.reload();
			}, function errorCallback(response){
			});
		}
		
	}
	
	this.togglePlayer = function(act, user, id){
		if(act == "select"){
			self.users.splice(id, 1);
			self.friends.push(user);
		}
		else{
			self.friends.splice(id, 1);
			self.users.push(user);
		}
	}


	this.dismiss = function(){
		$mdDialog.hide();
	}
});