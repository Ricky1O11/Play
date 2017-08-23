angular.module("play")
.directive('backImgBoardgame', ["$mdTheming", function($mdTheming){
	
    var primary500 = $mdTheming.THEMES["myTheme"];
    return function(scope, element, attrs){
        attrs.$observe('backImgBoardgame', function(url) {
            element.css({
                'background': 'url('+url+')',
                'background': 'url('+url+')',
                'background': 'url('+url+')',
                'background': 'url('+url+')',
            });
         });
    };
}]);