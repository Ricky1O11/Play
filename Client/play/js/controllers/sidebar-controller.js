angular.module("play").controller('sidebarController', function($scope) {

	controllerSidebar=this;

	this.checkImg = function(){
		if($scope.img=="") 
			return false;
		else
			return true;
	}

});