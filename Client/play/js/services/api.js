angular.module('play')
.factory('Api', function ApiFactory($http, $cookies){
	if($cookies.get('tok') != undefined){
		$http.defaults.headers.common['Authorization'] = 'JWT ' + $cookies.get('tok');
	}
	var b,d,dpp,dppu,f,fp,l,m,md,mp,mpu,ms,pp,r,sfp,t,tok,ts,tp,u,us;
	var BASE_URL = "http://127.0.0.1:8000/server"
	return{

		login:		function(data){
						tok = $http({method: 'POST', url: BASE_URL+'/auth/token/', data:data});
						return tok;
					},

		user:		function(user_id){
						u = $http({method: 'GET', url: BASE_URL+'/users/'+user_id+'/?include=user_stats'});
						return u;
					},
					
		users:		function(){
						us = $http({method: 'GET', url: BASE_URL+'/users/'});
						return us;
					},
		favourites:	function(){
						f = $http({method: 'GET', url: BASE_URL+'/boardgames/favourites/'});
						return f;
					},
					
		recents:	function(user_id){
						r = $http({method: 'GET', url: BASE_URL+'/boardgames/recents/'});
						return r;
					},
		boadgames:	function(){
						l = $http({method: 'GET', url: BASE_URL+'/boardgames/'});
						return l;
					},
		boardgame:	function(id){
						b = $http({method: 'GET', url: BASE_URL+'/boardgames/'+id+'/?include=matches'});
						return b;
					},		
		match:		function(id){
						m = $http({method: 'GET', url: BASE_URL+'/matches/'+id+'/'});
						return m;
					},	
		matches:	function(){
						ms = $http({method: 'GET', url: BASE_URL+'/boardgames/recents/?include=matches'});
						return ms;
					},	
		matchpost:	function(match){
						mp = $http({method: 'POST', url: BASE_URL+'/matches/', data:match});
						return mp;
					},
		matchput:	function(match,id){
						mpu = $http({method: 'PUT', url: BASE_URL+'/matches/'+id+'/', data:match});
						return mpu;
					},
		matchdelete:function(id){
						md = $http({method: 'DELETE', url: BASE_URL+'/matches/'+id+'/'});
						return md;
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
						dpp = $http({method: 'POST', url: BASE_URL+'/detailedpoints/', data:dp});
						return dpp;
					},
		dpPut:	function(dp,id){
						dppu = $http({method: 'PUT', url: BASE_URL+'/detailedpoints/'+id+'/', data:dp});
						return dppu;
					},
		favouritepost:	function(data){
						fp = $http({method: 'POST', url: BASE_URL+'/favourites/', data:data});
						return fp;
					},
		favouritedelete:	function(fav){
						fd = $http({method: 'DELETE', url: BASE_URL+'/favourites/'+fav+'/'});
						return fd;
					},
		scoringfieldspost:	function(sf){
						sfp = $http({method: 'POST', url: BASE_URL+'/scoringfields/', data:sf});
						return sfp;
					},
		
	}
});