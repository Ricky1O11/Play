//controller for the home page screen
angular.module("play").controller('homeController', function(Api, Utils, $scope, currentAuth) {
	homeContr = this;
	homeContr.toggleFavourite = Utils.toggleFavourite;
	Api.matches(currentAuth.uid).$loaded().then(function(data){
		homeContr.games=data;
		console.log(homeContr.games);
		for(i = 0; i< homeContr.games.length; i++){
			homeContr.games[i].visible = false;
			homeContr.games[i].lastMatchTime = 0;
			for(match in homeContr.games[i].matches)
				homeContr.games[i].lastMatchTime = Math.max(homeContr.games[i].lastMatchTime, homeContr.games[i].matches[match].time);
		}
	});
});