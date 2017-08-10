angular.module("play")
.directive('profileImg', ["$mdTheming", function($mdTheming){
    
    var primary500 = $mdTheming.THEMES["myTheme"];
    return function(scope, element, attrs){
        attrs.$observe('profileImg', function(user_id) {
            firebase.storage().ref().child('images/avatar/'+user_id+'/'+user_id).getDownloadURL().then(function(url) {
               element.css({
                    'background-image': 'url(' + url +')',
                    'background-repeat' : 'no-repeat',
                    'background-size' : 'cover',
                    'background-position' : 'center',
                });
            }).catch(function(error) {
              // Handle any errors
            });
            
         });
    };
}]);