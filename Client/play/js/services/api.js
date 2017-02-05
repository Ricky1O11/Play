angular.module('play')
.factory('Api', function ApiFactory($http){
	user_id=2;
	var u,us,f,r,l,b,m,mp,pp,ms,t;
	var BASE_URL = "localhost/server"
	return{
		user:		function(){
						//if(typeof u === "undefined"){
							u = $http({method: 'GET', url: BASE_URL+'/users/'+user_id+'/?include=user_stats'});
						//}
						return u;
					},
					
		users:		function(){
							us = $http({method: 'GET', url: BASE_URL+'/users/'});
						return us;
					},
		favourites:	function(){
						f = $http({method: 'GET', url: BASE_URL+'/boardgames/favourites/?user_id='+user_id});
						return f;
					},
					
		recents:	function(){
						r = $http({method: 'GET', url: BASE_URL+'/boardgames/recents/?user_id='+user_id});
						return r;
					},
		boadgames:		function(){
						l = $http({method: 'GET', url: BASE_URL+'/boardgames/?user_id='+user_id});
						return l;
					},
		boardgame:	function(id){
						b = $http({method: 'GET', url: BASE_URL+'/boardgames/'+id+'/?include=matches&user_id='+user_id});
						return b;
					},		
		match:		function(id){
						m = $http({method: 'GET', url: BASE_URL+'/matches/'+id+'/?user_id='+user_id});
						return m;
					},	
		matches:	function(){
						ms = $http({method: 'GET', url: BASE_URL+'/boardgames/recents/?user_id='+user_id+'&include=matches'});
						return ms;
					},	
		matchpost:	function(match){
						mp = $http({method: 'POST', url: BASE_URL+'/matches/', data:match});
						return mp;
					},
					
		playpost:	function(plays){
						pp = $http({method: 'POST', url: BASE_URL+'/plays/', data:plays});
						return pp;
					},
		template:	function(boardgame){
						t = $http({method: 'GET', url: BASE_URL+'/templates/'+boardgame+'/'});
						return t;
					},	
		
	}
});