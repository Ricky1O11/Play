//controller for the single match page
angular.module("play").controller('loginController', function(Api, $cookies, $route) {
	this.login = {};
	this.login.username = "";
	this.login.password = "";
	controller = this;
	this.submit = function(){
		Api.login(controller.login).then(function(response){
				if(response.status==200){
					var expireDate = new Date();
					expireDate.setDate(expireDate.getDate() + 7);
					$cookies.put('tok', response.data.token, {'expires': expireDate});
					$route.reload();
				}
			}, function errorCallback(data){
				console.log(data);
			});
	}
});