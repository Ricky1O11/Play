//controller for the home page screen
angular.module("play").controller('homeController', function(Api, Utils, $scope, currentAuth) {
	homeContr = this;
	homeContr.toggleFavourite = Utils.toggleFavourite;
	homeContr.addFriend = Utils.addFriend;
	homeContr.removeFriend = Utils.removeFriend;

	Api.user_templates(currentAuth.uid).$loaded().then(function(data){
		homeContr.templates=data;
		console.log(homeContr.templates);
		
	});
});