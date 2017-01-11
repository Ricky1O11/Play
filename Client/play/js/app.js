(function(){
  angular.module('play',["ngMaterial", "ngRoute", ])
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
  .run(function($rootScope, $location, $mdDialog) {
        $rootScope.goTo = function(pk) {
            $location.path("boardgames/"+pk);
        };
		
		$rootScope.matchesPopup = function(ev) {
			$mdDialog.show({
			  controller: 'matchesDialogController',
			  controllerAs: 'mdCtrl',
			  templateUrl: 'templates/matchesdialog.html',
			  parent: angular.element(document.body),
			  targetEvent: ev,
			  clickOutsideToClose:true,
			  //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			})	
		}
		
    });
})();