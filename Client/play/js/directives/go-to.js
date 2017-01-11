angular.module("play")
.directive('goTo', ["$location", function($location){
    return function(scope, element, attrs){
        var url = attrs.backImg;
    };
}]);