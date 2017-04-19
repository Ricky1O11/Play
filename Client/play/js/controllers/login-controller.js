//controller for login
angular.module("play").controller('loginController', function(Api, $cookies, $rootScope, $window) {
	this.login = {};
	this.login.username = "";
	this.login.password = "";
	loginController = this;

	this.submit = function(){
		Api.login(loginController.login).then(
			function(response){
				if(response.status==200){
					var expireDate = new Date();
					expireDate.setDate(expireDate.getDate() + 7);
					$cookies.put('tok', response.data.token, {'expires': expireDate});
					$window.location.reload();
				}
			}, function errorCallback(response){
				$rootScope.showToast("Wrong email or password");
			});
	};
});