angular.module('play')
.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'templates/profile/index.html',
		controller: 'profileController',
		controllerAs: 'pCtrl'
		/*templateUrl: 'templates/home/index.html',
		controller: 'homeController',
		controllerAs: 'hCtrl'*/
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
		controllerAs: 'bCtrl'
	})
	.when('/matches/:id', {
		templateUrl: 'templates/match/index.html',
		controller: 'matchController',
		controllerAs: 'mCtrl'
	})
	.when('/matches', {
		templateUrl: 'templates/matches/index.html',
		controller: 'matchesController',
		controllerAs: 'msCtrl'
	})
	.otherwise({
		redirectTo: '/',
	})
});