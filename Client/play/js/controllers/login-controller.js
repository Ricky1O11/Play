//controller for login
angular.module("play").controller('loginController', function(Api, Auth, $scope, $cookies, $rootScope, $window) {
	this.login = {};
	this.login.email = "";
	this.login.password = "";
	loginController = this;



	this.submit = function(){
		
		Auth.$signInWithEmailAndPassword(loginController.login.email, loginController.login.password).then(function(firebaseUser) {
			console.log(firebaseUser);
			$scope.user = firebaseUser;
		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});
	};
});