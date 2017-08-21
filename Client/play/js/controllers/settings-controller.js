//controller for user profile
angular.module("play").controller('settingsController', function(Utils, $rootScope) {
	controller = this;
	controllerSidebar=this;


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