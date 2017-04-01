angular.module('play')
.factory('Api', function ApiFactory($http, $cookies){
	if($cookies.get('tok') != undefined){
		$http.defaults.headers.common['Authorization'] = 'JWT ' + $cookies.get('tok');
	}
	var b,d,dpp,dppu,f,fp,fr,l,m,md,mp,mpu,ms,pp,r,reg, sfp,t,tok,ts,tp,u,us;
	var BASE_URL = "http://127.0.0.1:8000/server"
	return{
		register:	function(data){
						reg = $http({method: 'POST', url: BASE_URL+'/register/', data:data});
						return reg;
					},
		login:		function(data){
						tok = $http({method: 'POST', url: BASE_URL+'/auth/token/', data:data});
						return tok;
					},

		user:		function(user_id){
						u = $http({method: 'GET', url: BASE_URL+'/users/'+user_id+'/?include=user_stats'});
						return u;
					},

		userput:		function(user_id, user_data){
						u = $http({method: 'PUT', url: BASE_URL+'/users/'+user_id+'/', data:user_data});
						return u;
					},

		profileput:		function(user_id, user_data){
						u = $http({method: 'PUT', url: BASE_URL+'/profiles/'+user_id+'/', data:user_data});
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
		friends:	function(){
						fr = $http({method: 'GET', url: BASE_URL+'/friends/'});
						return fr;
					},
		friendspost:	function(data){
						frp = $http({method: 'POST', url: BASE_URL+'/friends/', data:data});
						return frp;
					},
		frienddelete:	function(id){
						frd = $http({method: 'DELETE', url: BASE_URL+'/friends/'+id+'/'});
						return frd;
					},
					
		recents:	function(user_id){
						r = $http({method: 'GET', url: BASE_URL+'/boardgames/recents/?user_id='+user_id});
						return r;
					},
		boadgames:	function(offset, limit, orderingField, key){
						console.log(BASE_URL+'/boardgames/?order_by='+orderingField+'&search_key='+key+'&limit='+limit+'+&offset='+offset);
						if(key != "")
							l = $http({method: 'GET', url: BASE_URL+'/boardgames/?order_by='+orderingField+'&search_key='+key+'&limit='+limit+'+&offset='+offset});
						else
							l = $http({method: 'GET', url: BASE_URL+'/boardgames/?order_by='+orderingField+'&limit='+limit+'+&offset='+offset});
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