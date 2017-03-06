(function(){
	angular.module('play',["ngMaterial", "ngRoute", "ngSanitize", "ngMessages", "ngCookies", "angular-jwt"])
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
	.run(function($rootScope, $location,  $mdDialog, Api, $mdToast, $cookies, $location, jwtHelper) {
			$rootScope.isLogged = false;
			$rootScope.match = {};
			$rootScope.goTo = function(url) {
					$location.path(url);
			};
			
			$rootScope.currentTab = 0;
			$rootScope.setCurrentTab = function(tab){
				$rootScope.currentTab = tab;
			}

			$rootScope.$on('$locationChangeStart', function(){
				if($cookies.get('tok') != null){
					$rootScope.user_pk=jwtHelper.decodeToken($cookies.get('tok')).user_id;
					$rootScope.isLogged = true;
				}
				else{
					$rootScope.isLogged = false;
				}
				$rootScope.path = $location.path();
				if($rootScope.randomColors === undefined){
					$rootScope.randomColors = {};
				}
			});

			$rootScope.matchesPopup = function(ev, user_pk) {
				$mdDialog.show({
					locals:{user_pk : user_pk},
					controller: 'matchesDialogController',
					controllerAs: 'mdCtrl',
					templateUrl: 'templates/matchesdialog.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					scope:$rootScope,
					preserveScope:true,	
					//fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
				})	
			}

			//randomly color the avatars of players without a profile picture
			

			$rootScope.getRandomColor = function(pk){
				rnd = Math.floor(Math.random()*5);
				switch (rnd){
					case 0: $rootScope.randomColors[pk] = {'background-color':'#448AFF'}; break; //blue
					case 1: $rootScope.randomColors[pk] = {'background-color':'#FF5252'}; break; //red
					case 2: $rootScope.randomColors[pk] = {'background-color':'#7C4DFF'}; break; //deep purple
					case 3: $rootScope.randomColors[pk] = {'background-color':'#4DB6AC'}; break; //teal
					default: $rootScope.randomColors[pk] = {'background-color':'#FFD740'}; break; //amber
				}
			}			
			//$rootScope.userRandomColor = $rootScope.getRandomColor();

			$rootScope.showToast=function(string){
				$mdToast.show(
						$mdToast.simple()
						.textContent(string)
						.hideDelay(3000)
						.position('top right')
				);
			}
		})
})();