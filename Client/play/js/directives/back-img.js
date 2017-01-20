angular.module("play")
.directive('backImg', ["$mdTheming", function($mdTheming){
		var primary500 = $mdTheming.THEMES["myTheme"];
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(url) {
            element.css({
                'background-image': 'url(' + url +')',
    			'background-color': 'black',
    			'background-repeat' : 'no-repeat',
                'background-size' : 'cover',
    			'background-position' : 'center',
            });
         });
    };
}]);