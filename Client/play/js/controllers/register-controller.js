//controller for registration
angular.module("play").controller('registerController', function(Api, $cookies, $window, $rootScope) {
	this.register = {};
	this.register.email = "";
	this.register.username = "";
	this.register.password = "";
	this.register.password2 = "";

	registerController = this;

	this.signin = function(){
		if(registerController.register.password === registerController.register.password2){
			Api.register(registerController.register).then(function(response){

					$rootScope.showToast("Congrats! You are now part of our team!");

					registerController.login = {};
					registerController.login.username = registerController.register.username;
					registerController.login.password = registerController.register.password;
					
					Api.login(registerController.login).then(
						function(response){
							if(response.status==200){
								var expireDate = new Date();
								expireDate.setDate(expireDate.getDate() + 7);
								$cookies.put('tok', response.data.token, {'expires': expireDate});
								$window.location.reload();
							}
						}, function errorCallback(response){
						});
				}, function errorCallback(response){
					$rootScope.showToast(response.data.username[0]);
			});
		}
		else{
			$rootScope.showToast("The two passwords must be equal!");
		}
	}
});