angular.module('play')
.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'templates/home/index.html',
		controller: 'homeController',
		controllerAs: 'pCtrl',
		resolve: {
		      // controller will not be loaded until $waitForSignIn resolves
		      // Auth refers to our $firebaseAuth wrapper in the factory below
		      "currentAuth": ["Auth", function(Auth) {
		        // $waitForSignIn returns a promise so the resolve waits for it to complete
		        return Auth.$waitForSignIn();
		      }]}
		/*templateUrl: 'templates/home/index.html',
		controller: 'homeController',
		controllerAs: 'hCtrl'*/
	})
	.when('/profile', {
		templateUrl: 'templates/profile/index.html',
		controller: 'profileController',
		controllerAs: 'pCtrl'
	})
	.when('/home', {
		templateUrl: 'templates/home/index.html',
		controller: 'homeController',
		controllerAs: 'hCtrl'
	})
	.when('/favourites', {
		templateUrl: 'templates/favourites/index.html',
		controller: 'favouritesController',
		controllerAs: 'fCtrl'
	})
	.when('/recents', {
		templateUrl: 'templates/recents/index.html',
		controller: 'recentsController',
		controllerAs: 'rCtrl'
	})
	.when('/boardgames', {
		templateUrl: 'templates/boardgames/index.html',
		controller: 'boardgamesController',
		controllerAs: 'bsCtrl'
	})
	.when('/boardgames/:id', {
		templateUrl: 'templates/boardgame/index.html',
		controller: 'boardgameController',
		controllerAs: 'bCtrl',
		resolve: {
		      "currentAuth": ["Auth", function(Auth) {
		        return Auth.$waitForSignIn();
		      }]}
	})
	.when('/matches/:id', {
		templateUrl: 'templates/match/index.html',
		controller: 'matchController',
		controllerAs: 'mCtrl'
	})
	.when('/matches', {
		templateUrl: 'templates/matches/index.html',
		controller: 'matchesController',
		controllerAs: 'msCtrl',
		resolve: {
		      "currentAuth": ["Auth", function(Auth) {
		        return Auth.$waitForSignIn();
		      }]}
	})
	.when('/users/:id', {
		templateUrl: 'templates/user/index.html',
		controller: 'userController',
		controllerAs: 'uCtrl'
	})
	.when('/designers/:id', {
		templateUrl: 'templates/designer/index.html',
		controller: 'designerController',
		controllerAs: 'dCtrl'
	})
	.when('/categories/:id', {
		templateUrl: 'templates/category/index.html',
		controller: 'categoryController',
		controllerAs: 'cCtrl'
	})
	.when('/templates', {
		templateUrl: 'templates/templates/index.html',
		controller: 'templatesController',
		controllerAs: 'tCtrl'
	})
	.otherwise({
		redirectTo: '/',
	})
});