angular.module("play").controller('sidebarController', function(Api, $mdDialog, $scope) {
	this.img="";
	this.match_played=0;
	this.match_won=0;
	this.username="";
	
	controllerSidebar=this;
	Api.user().success(function(data){
		controllerSidebar.match_played = data.match_played;
		controllerSidebar.match_won = data.match_won;
		controllerSidebar.username = data.username;
		controllerSidebar.img = data.img;
	});

	this.checkImg = function(){
	
		console.log (controllerSidebar.img);
		if(controllerSidebar.img=="") 
			return false;
		else
			return true;
	}
});