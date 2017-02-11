angular.module('play')
.factory('Api', function ApiFactory($http){
	var u,us,f,r,l,b,m,mp,pp,ms,t,ts,tp,dpp,fp,d;
	var BASE_URL = "http://127.0.0.1:8000/server"
	return{
		user:		function(user_id){
						//if(typeof u === "undefined"){
							u = $http({method: 'GET', url: BASE_URL+'/users/'+user_id+'/?include=user_stats'});
						//}
						return u;
					},
					
		users:		function(){
							us = $http({method: 'GET', url: BASE_URL+'/users/'});
						return us;
					},
		favourites:	function(user_id){
						f = $http({method: 'GET', url: BASE_URL+'/boardgames/favourites/?user_id='+user_id});
						return f;
					},
					
		recents:	function(user_id){
						r = $http({method: 'GET', url: BASE_URL+'/boardgames/recents/?user_id='+user_id});
						return r;
					},
		boadgames:		function(user_id){
						l = $http({method: 'GET', url: BASE_URL+'/boardgames/?user_id='+user_id});
						return l;
					},
		boardgame:	function(id, user_id){
						b = $http({method: 'GET', url: BASE_URL+'/boardgames/'+id+'/?include=matches&user_id='+user_id});
						return b;
					},		
		match:		function(id, user_id){
						m = $http({method: 'GET', url: BASE_URL+'/matches/'+id+'/?user_id='+user_id});
						return m;
					},	
		matches:	function(user_id){
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
		dictionary:	function(){
						d = $http({method: 'GET', url: BASE_URL+'/dictionary/'});
						return d;
					},
		dictionarypost:	function(dict){
						dp = $http({method: 'POST', url: BASE_URL+'/dictionary/', data:dict});
						return dp;
					},
		templates:	function(boardgame){
						ts = $http({method: 'GET', url: BASE_URL+'/templates/?boardgame_id='+boardgame});
						return ts;
					},
		template:	function(pk){
						t = $http({method: 'GET', url: BASE_URL+'/templates/'+pk+'/'});
						return t;
					},
		templatespost:	function(templates){
						tp = $http({method: 'POST', url: BASE_URL+'/templates/', data:templates});
						return tp;
					},
		dpPost:	function(dp){
						dpp = $http({method: 'POST', url: BASE_URL+'/points/', data:dp});
						return dpp;
					},
		favouritepost:	function(data){
						fp = $http({method: 'POST', url: BASE_URL+'/favourites/', data:data});
						return fp;
					},
		favouritedelete:	function(fav){
						fd = $http({method: 'DELETE', url: BASE_URL+'/favourites/'+fav+'/'});
						return fd;
					},
		
	}
});