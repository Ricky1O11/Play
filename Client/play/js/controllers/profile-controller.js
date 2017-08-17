//controller for user profile
angular.module("play").controller('profileController', function(Api, Utils, $rootScope, $scope, $routeParams) {
	this.params=$routeParams;
	controller = this;
	if(this.params){
		controller.currT = this.params.id;
	}
	else{
		controller.currT = 0
	}
	controllerSidebar=this;

	console.log($rootScope);


	var fileInput = document.getElementById('fileInput');
	fileInput.addEventListener('change', changeInput);

	function changeInput() {
		var file = fileInput.files[0];
		var reader = new FileReader();
		reader.readAsDataURL(file);
		 reader.onload = function(e) {
			Utils.uploadImage(file);
	    };
	}
});