(function(){
  angular.module('play',["ngMaterial", "ngRoute", "ngSanitize"])
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
  .run(function($rootScope, $location, $mdDialog, Api) {
        $rootScope.goTo = function(url) {
            console.log(url);
            $location.path(url);

        };
		
  		$rootScope.matchesPopup = function(ev, user_pk) {
        console.log(user_pk);
  			$mdDialog.show({
          locals:{user_pk : user_pk},
  			  controller: 'matchesDialogController',
  			  controllerAs: 'mdCtrl',
  			  templateUrl: 'templates/matchesdialog.html',
  			  parent: angular.element(document.body),
  			  targetEvent: ev,
  			  clickOutsideToClose:true,
  			  //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
  			})	
  		}

      //randomly color the avatars of players without a profile picture
      $rootScope.getRandomColor = function(){
        rnd = Math.floor(Math.random()*5);
        switch (rnd){
          case 0: return {'background-color':'#448AFF'}; //blue
          case 1: return {'background-color':'#FF5252'}; //red
          case 2: return {'background-color':'#7C4DFF'}; //deep purple
          case 3: return {'background-color':'#4DB6AC'}; //teal
          default: return {'background-color':'#FFD740'}; //amber
        }
      }
      $rootScope.randomColor = $rootScope.getRandomColor();
      
      $rootScope.$on("$locationChangeStart", function (event, next, current) {
          $rootScope.path = $location.path();
          console.log($rootScope.path);
        });
    })
})();