angular.module('play')
.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'templates/home/index.html',
		controller: 'homeController',
		controllerAs: 'hCtrl'
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
		templateUrl: 'templates/list/index.html',
		controller: 'listController',
		controllerAs: 'lCtrl'
	})
	.when('/boardgames/:id', {
		templateUrl: 'templates/boardgames/index.html',
		controller: 'boardgamesController',
		controllerAs: 'bCtrl'
	})
	.when('/matches/:id', {
		templateUrl: 'templates/match/index.html',
		controller: 'matchController',
		controllerAs: 'mCtrl'
	})
	.otherwise({
		redirectTo: '/',
	})
});