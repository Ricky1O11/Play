 angular.module('play')
.factory('Api', function ApiFactory($http, $cookies,$firebaseObject, $firebaseArray){
	if($cookies.get('tok') != undefined){
		$http.defaults.headers.common['Authorization'] = 'JWT ' + $cookies.get('tok');
	}
	var b,d,dpp,dppu,f,fp,fr,l,m,md,mp,mpu,ms,pp,r,reg, sfp,t,tok,ts,tp,tpu,u,us;
	var BASE_URL = "http://127.0.0.1:8000/server"
	//var BASE_URL = "http://playapi.pythonanywhere.com/server"
	return{
		register:	function(uid, username){
				var ref = firebase.database().ref();
				var obj = $firebaseObject(ref.child('profiles').child(uid));
				obj.username = username;
				obj.first_name = "";
				obj.second_name = "";
				obj.image = '';
				obj.visibility_group = 0;
				obj.fav_setting = true;
				obj.rec_setting = false;
				obj.match_won = 0;
				obj.match_played = 0;

				obj.$save();
				return "success"
					},

		user:		function(user_id){
				var ref = firebase.database().ref().child("profiles").child(user_id);
				var syncObject = $firebaseObject(ref);
				return syncObject;
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
				var ref = firebase.database().ref().child("profiles");
				var syncArray = $firebaseArray(ref);
				return syncArray;
					},
		favourites:	function(key){
						f = $http({method: 'GET', url: BASE_URL+'/boardgames/favourites/?search_key='+key});
						return f;
					},
		friends:	function(user_id){
						var ref = firebase.database().ref().child("friends").child(user_id);
						var syncObject = $firebaseObject(ref);
						return syncObject;
					},
		friendspost:	function(user,friend){
						var ref = firebase.database().ref().child("friends").child(user.uid).child("outbound").child(friend.$id).set({"username":friend.username, "image":friend.image, "accepted":true});
						var ref = firebase.database().ref().child("friends").child(friend.$id).child("inbound").child(user.uid).set({"username":user.profile_details.username, "image":user.profile_details.image, "accepted":false});
						
						return ref;

					},
		frienddelete:	function(user_id,friend_id){
						console.log(user_id)
						console.log(friend_id)
						var ref = firebase.database().ref().child("friends").child(user_id).child("outbound").child(friend_id).remove();
						var ref = firebase.database().ref().child("friends").child(friend_id).child("inbound").child(user_id).remove();
						return ref;
					},
					
		recents:	function(user_id){
						r = $http({method: 'GET', url: BASE_URL+'/boardgames/recents/?user_id='+user_id});
						return r;
					},
		boadgames:	function(query, limit, orderingField, endAt, endAtKey){
				if(orderingField == "name"){
					if(query!=""){
						var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).startAt(query).limitToFirst(limit);
					}
					else{
						var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).limitToFirst(limit);
					}
				}
				else{
					if(endAtKey == ""){
						var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).endAt(endAt).limitToLast(limit);
					}
					else{
						var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).endAt(endAt, endAtKey).limitToLast(limit);
					}
				}

				var syncArray = $firebaseArray(ref);
				return syncArray;
					},
		boardgame:	function(id){
				var ref = firebase.database().ref().child("boardgames").child(id);
				var syncObject = $firebaseObject(ref);
				return syncObject;
					},	
		designer: function(id){
						d = $http({method: 'GET', url: BASE_URL+'/designers/'+id+'/?include=boardgames'});
						return d;
					},
		category: function(id){
						c = $http({method: 'GET', url: BASE_URL+'/categories/'+id+'/?include=boardgames'});
						return c;
					},		
		match:		function(id){
					var ref = firebase.database().ref().child("matches").child(""+id);
					var syncObject = $firebaseObject(ref);
					return syncObject;
					},	
		matches:	function(user_id, boardgame_id){
				if(boardgame_id)
					var ref = firebase.database().ref().child("user_played_matches").child(user_id).child(boardgame_id).child("matches");
				else
					var ref = firebase.database().ref().child("user_played_matches").child(user_id);
				var syncArray = $firebaseArray(ref);
				return syncArray;
					},	
		matchpost:	function(values, simpleObject){
					var ref = firebase.database().ref().child("matches").push(values);
					var syncObject = $firebaseObject(ref);

					var ref = firebase.database().ref()
					.child("boardgame_has_matches")
					.child(""+values.boardgame.bggId)
					.child(""+syncObject.$id)
					.set(simpleObject);

					for(player in values.players){
						var ref = firebase.database().ref();
						ref.child("user_played_matches")
						.child(""+values.players[player].uid)
						.child(""+values.boardgame.bggId)
						.child("matches")
						.child(""+syncObject.$id)
						.set(simpleObject);

						ref.child("user_played_matches")
						.child(""+values.players[player].uid)
						.child(""+values.boardgame.bggId).
						update({
							"name":values.boardgame.name,
							"thumbnail":values.boardgame.thumbnail,
							"image":values.boardgame.image,
							"bggId":values.boardgame.bggId,
						})
					}

					return syncObject;
					},
		expansionpost:	function(exp){
						mp = $http({method: 'POST', url: BASE_URL+'/playedExp/', data:exp});
						return mp;
					},
		matchdelete:function(bggId, players, match_id){
						var ref = firebase.database().ref();

						ref.child("boardgame_has_matches")
						.child(""+bggId)
						.child(""+match_id)
						.remove();

						for(k in players){
							ref.child("user_played_matches")
							.child(""+players[k].uid)
							.child(""+bggId)
							.child("matches")
							.child(""+match_id)
							.remove();
						}

						obj = ref.child("matches").child(""+match_id).remove();
						return obj;
					},
					
		playpost:	function(match, plays){
					var ref = firebase.database().ref().child("matches").child(""+match).child("plays").push(plays);
					var syncObject = $firebaseObject(ref);
					return syncObject;
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
			console.log(boardgame);
			var ref = firebase.database().ref().child("boardgame_has_templates").child(""+boardgame);
			var syncArray = $firebaseArray(ref);
			return syncArray;
					},
		template:	function(pk){
						t = $http({method: 'GET', url: BASE_URL+'/templates/'+pk+'/'});
						return t;
					},
		templatespost:	function(boardgame, template){
			var ref = firebase.database().ref().child("boardgame_has_templates").child(""+boardgame).push(template);
			var syncArray = $firebaseObject(ref);
			return syncArray;
					},

		templateput:	function(boardgame, template_id, template){
			var ref = firebase.database().ref().child("boardgame_has_templates").child(""+boardgame).child(template_id).update(template);
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