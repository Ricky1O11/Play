//controller for login
angular.module("play").controller('loginController', function(Api, Auth, $scope, $cookies, $rootScope, $route, $window) {
	
	console.log(firebase.auth.GoogleAuthProvider);
	var uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        callbacks: {
          signInSuccess: function(currentUser, credential, redirectUrl) {
            $scope.user = firebaseUser;
			$route.reload();
            return true;
          }
        },

      };

      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebase-ui', uiConfig);


	//this.login = {};
	//this.login.email = "";
	//this.login.password = "";
	//loginController = this;

	//var provider = new firebase.auth.GoogleAuthProvider();


	//this.submit = function(){	
	//	Auth.$signInWithEmailAndPassword(loginController.login.email, loginController.login.password).then(function(firebaseUser) {
	//		$scope.user = firebaseUser;
	//		$route.reload();
	//	}).catch(function(error) {
	//		console.error("Authentication failed:", error);
	//	});
	//};
//
	//this.googleSubmit = function(){
	//	Auth.$signInWithPopup("google").then(function(result) {
	//			console.log(result);
	//		  	$scope.user = result.user;
	//			$route.reload();
	//		}).catch(function(error) {
//
	//		});
	//}

});