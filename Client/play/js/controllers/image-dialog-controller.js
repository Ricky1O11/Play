 //controller for the popup dialog used to display the image
angular.module("play").controller('imageDialogController', function($scope, url) {
	self=this;
	self.url = url;
});