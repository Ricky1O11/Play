 (function(){
	// Initialize Firebase
	var config = {
	    apiKey: "AIzaSyBI2Uab-jJ5RVzVppEvibmOlnHJRBgScnQ",
	    authDomain: "play-4fd54.firebaseapp.com",
	    databaseURL: "https://play-4fd54.firebaseio.com/",
	    projectId: "play-4fd54",
	    storageBucket: "gs://play-4fd54.appspot.com",
	    messagingSenderId: "603822728152"
	};
	firebase.initializeApp(config);

	angular.module('play',["firebase", "ngMaterial", "ngRoute", "ngSanitize", "ngMessages", "ngCookies", "angular-jwt", 'angular.filter', "chart.js"])
	.config(function($mdThemingProvider) {
	$mdThemingProvider.setDefaultTheme('myTheme');
		$mdThemingProvider.theme('myTheme')
		.primaryPalette('indigo', {
										'default': '600', // by default use shade 400 from the pink palette for primary intentions
										'hue-1': '400', // use shade 100 for the <code>md-hue-1</code> class
										'hue-2': '800', // use shade 600 for the <code>md-hue-2</code> class)
						})
		.accentPalette('deep-orange', {
										'default': 'A400', // by default use shade 400 from the pink palette for primary intentions
										'hue-1': 'A700', // use shade 100 for the <code>md-hue-1</code> class
										'hue-2': 'A700', // use shade 600 for the <code>md-hue-2</code> class)
						});
	})
	.config(['ChartJsProvider', function (ChartJsProvider) {
	    // Configure all charts
	    ChartJsProvider.setOptions({
	      chartColors: ['#3F51B5', '#FF6E40'],
	      responsive: true,
	      scales : {
		        yAxes: [{
		            display: true,
		            ticks: {
		                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
		                // OR //
		                beginAtZero: true   // minimum value will be 0.
		            }
		        }]
    		}
	    });
	    // Configure all line charts
	    ChartJsProvider.setOptions('line', {
	      showLines: true
	    });
	}])

	.run(function(Utils, Auth, $rootScope, $timeout, Api) {
			$rootScope.lang = "it";

			// any time auth state changes, add the user data to scope
		    Auth.$onAuthStateChanged(function(firebaseUser) {
			      	$rootScope.user = firebaseUser;
			      	if($rootScope.user){
				      	var dbuser = Api.user($rootScope.user.uid);
						dbuser.$bindTo($rootScope, "user.profile_details");
						var friends = Api.friends($rootScope.user.uid);
						friends.$bindTo($rootScope, "user.friends");
						var matches = Api.matches($rootScope.user.uid);
						matches.$loaded().then(Utils.getUserMatches);
						$rootScope.$watch('user.friends', Utils.playNewFriendNotification);
					}
		    });

			$timeout(function () {
		       $rootScope.l = true;
		    }, 300);


			$rootScope.randomColors = {};
			$rootScope.match = {};

			$rootScope.goTo = Utils.goTo;
			
			
			$rootScope.showPopup = Utils.showPopup;
			$rootScope.showImage = Utils.showImage;
			$rootScope.getRandomColor = Utils.getRandomColor;
			$rootScope.showToast = Utils.showToast;
			$rootScope.uploadImage = Utils.uploadImage;

			//$rootScope.currentTab = 0;
			//$rootScope.setCurrentTab = function(tab){
			//	$rootScope.currentTab = tab;
			//}

		})
})();