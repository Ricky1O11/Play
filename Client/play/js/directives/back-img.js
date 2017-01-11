angular.module("play")
.directive('backImg', ["$mdTheming", function($mdTheming){
		var primary500 = $mdTheming.THEMES["myTheme"];
	//	console.log(primary500.colors);
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
			'background-color': 'black',
			'background-repeat' : 'no-repeat',
            'background-size' : 'contain',
			'background-position' : 'center',
        });
    };
}]);