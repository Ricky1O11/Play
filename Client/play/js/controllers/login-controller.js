//controller for login
angular.module("play").controller('loginController', function(Api, Auth, $scope, $cookies, $rootScope, $window) {
	this.login = {};
	this.login.username = "";
	this.login.password = "";
	loginController = this;



	this.submit = function(){
		
		Auth.$signInWithEmailAndPassword(loginController.login.username, loginController.login.password).then(function(firebaseUser) {
			console.log(firebaseUser);
			$scope.user = firebaseUser;
		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});
	};
});