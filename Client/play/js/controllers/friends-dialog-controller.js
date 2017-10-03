 //controller for the popup dialog used to insert a new match
angular.module("play").controller('friendsDialogController', function(Utils, $scope, Api, $route, $rootScope, $mdDialog, $location, user_pk) {

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
	//Api.users().$loaded().then(function(data){
	//	for (i=0; i<data.length; i++){
	//		if(data[i].$id != $rootScope.user.uid
	//			&& (!$rootScope.user.friends.outbound || !(data[i].$id in $rootScope.user.friends.outbound))
	//			&& (!$rootScope.user.friends.inbound || !(data[i].$id in $rootScope.user.friends.inbound))){
	//			self.users.push(data[i]);
	//		}
	//	}
	//});

	// Search for friends
	self.querySearchFriends = function (query) {
		var query = query.toLowerCase();
		if (query != ""){
			self.endAt = query.substring(0, query.length-1) + 
						Utils.changeLetter(query.substring(query.length-1, query.length-0))
		}

		return Api.users(query, 20, "search_username", self.endAt, "").$loaded().then(function(response){
			self.users = [];
			for (i=0; i<response.length; i++){
				if(response[i].search_username.indexOf(query.toLowerCase()) !== -1){
					self.users[i] = 
						{
							uid: response[i].$id,
							username: response[i].username,
							image: response[i].image,
							points: 0,
						};
				}
			}
			return self.users;
		});
	}

	this.saveFriends = function(){
		console.log("ok");
		for(i=0; i<self.friends.length;i++){
			console.log(self.friends[i]);
			Api.friendspost($rootScope.user, self.friends[i]).then(function(response){
				$rootScope.showToast("Good job! You have "+self.friends.length+" new friends!");
				$mdDialog.hide();
				$route.reload();
			}, function errorCallback(response){
			});
		}
		
	}
	
	this.toggleFriend = function(act, user, id){
		if(user!=undefined){
			if(act == "select"){
				if(!(user.uid in $rootScope.user.friends.outbound) && !(user.uid in $rootScope.user.friends.inbound)){
					if(user.uid != $rootScope.user.uid){
						self.friends.push(user);
					}
					else{
						$rootScope.showToast("You cannot add yourself to your friends!");
					}
				}
				else{
					$rootScope.showToast("You are already friends!");
				}
			}
			else{
				self.friends.splice(id, 1);
			}
		}
	}


	//this.togglePlayer = function(act, user, team, index){
	//	if(user != undefined){
	//		if(act == "select"){
	//			self.selectedValues.players[""+user.uid] = user;
	//			self.players.push(user);
	//			self.selectedPlayer = "";
	//		}
	//		else{
	//			delete self.selectedValues.players[""+user.uid];
	//			self.players.splice(index, 1);
	//		}
	//	}
	//}

	this.dismiss = function(){
		$mdDialog.hide();
	}
});