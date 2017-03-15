 //controller for the popup dialog used to insert a new match
angular.module("play").controller('friendsDialogController', function($scope, Api, $rootScope, $mdDialog, $location, user_pk) {

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
	Api.users().success(function(data){
		console.log(data);
		for (i=0; i<data.length; i++){
			if(data[i].pk != user_pk || data[i].friendship!=0){
				self.users.push({display:data[i].username, friendship:data[i].friendship, value:data[i].username.toLowerCase(), pk:data[i].pk, img:data[i].profile_details.img})
			}
		}
	});

	this.saveFriends = function(){
		listUsers = [];
		console.log("ok");
		for(i=0; i<self.friends.length;i++){
			console.log("for ok");
			rowAddFriend = {
			'user1' : $rootScope.user_pk,
			'user2' : self.friends[i].pk
			}
			listUsers.push(rowAddFriend);
		}
		
		Api.friendspost(listUsers).then(function(response){
			$rootScope.showToast("Good job! You have "+listUsers.length+" new friend!");
		}, function errorCallback(response){
		});
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