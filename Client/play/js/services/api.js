angular.module('play')
.factory('Api', function ApiFactory($http){
	user_id=2;
	var u,us,f,r,l,b,m,mp,pp,ms,t;
	return{
		user:		function(){
						//if(typeof u === "undefined"){
							u = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/users/'+user_id+'/?include=user_stats'});
						//}
						return u;
					},
					
		users:		function(){
							us = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/users/'});
						return us;
					},
		favourites:	function(){
						f = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/boardgames/favourites/?user_id='+user_id});
						return f;
					},
					
		recents:	function(){
						r = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/boardgames/recents/?user_id='+user_id});
						return r;
					},
		boadgames:		function(){
						l = $http({method: 'GET', url: 'http://chrissj2.pythonanywhere.com/server/boardgames/?user_id='+user_id});
						return l;
					},
		boardgame:	function(id){
						b = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/boardgames/'+id+'/?include=matches&user_id='+user_id});
						return b;
					},		
		match:		function(id){
						m = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/matches/'+id+'/?user_id='+user_id});
						return m;
					},	
		matches:	function(){
						ms = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/boardgames/recents/?user_id='+user_id+'&include=matches'});
						return ms;
					},	
		matchpost:	function(match){
						mp = $http({method: 'POST', url: 'http://127.0.0.1:8000/server/matches/', data:match});
						return mp;
					},
					
		playpost:	function(plays){
						pp = $http({method: 'POST', url: 'http://127.0.0.1:8000/server/plays/', data:plays});
						return pp;
					},
		template:	function(boardgame){
						t = $http({method: 'GET', url: 'http://127.0.0.1:8000/server/templates/'+boardgame+'/'});
						return t;
					},	
		
	}
});