//controller for registration
angular.module("play").controller('registerController', function(Api, Auth, $firebaseObject, $cookies, $window, $rootScope) {
	this.register = {};
	this.register.email = "";
	this.register.username = "";
	this.register.password = "";
	this.register.password2 = "";
	registerController = this;

	this.signin = function(){
		if(registerController.register.password === registerController.register.password2){
			Auth.$createUserWithEmailAndPassword(registerController.register.email, registerController.register.password)
		        .then(function(firebaseUser) {
		        	$rootScope.showToast("Good job! We sent you and e-mail to confirm your account");
		        	
		        	var user = firebase.auth().currentUser;
		        	user.sendEmailVerification().then(function() {
						console.log("email sent")
					}).catch(function(error) {
						console.log("email error")
					
					});
		        	register = Api.register(firebaseUser.uid, registerController.register.username)
					
		        }).catch(function(error) {
		          $rootScope.showToast(error.message);
		        });
		}
    }
});