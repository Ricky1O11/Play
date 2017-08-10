 angular.module('play')
.factory('Api', function ApiFactory($firebaseObject, $firebaseArray){
	//var BASE_URL = "http://127.0.0.1:8000/server"
	//var BASE_URL = "http://playapi.pythonanywhere.com/server"
	return{
		register:	function(uid, username){
			console.log(username);
			console.log(uid);
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
				obj.match_finished = 0;

				obj.$save();
				return "success"
					},

		user:	function(user_id){
				var ref = firebase.database().ref().child("profiles").child(user_id);
				var syncObject = $firebaseObject(ref);
				return syncObject;
					},
				
		users:	function(){
					var ref = firebase.database().ref().child("profiles");
					var syncArray = $firebaseArray(ref);
					return syncArray;
				},
		userput:	function(user_id, field, value){
					rootRef = firebase.database().ref();

					user_ref = firebase.database().ref().child("profiles").child(user_id);
					user_matches_ref = firebase.database().ref().child("user_played_matches");
					return user_matches_ref.once('value').then(snap=>{
						update = {};
						for(u in snap.val()){
							user = snap.val()[u];
							for(g in user){
								game = user[g];
								for(m in game.matches){
									match = game.matches[m];
									update['matches/'+m+'/players/'+user_id+'/'+field] = value;
									update['user_played_matches/'+u+'/'+g+'/matches/'+m+'/players/'+user_id+'/'+field] = value;
								}
							}
						}
						friends_ref = firebase.database().ref().child("friends").child(user_id);
						friends_ref.once('value').then(sn=>{
							for(f in sn.val()["outbound"]){
								update['friends/'+f+'/inbound/'+user_id+'/'+field] = value;
							}
							for(f in sn.val()["inbound"]){
									update['friends/'+f+'/outbound/'+user_id+'/'+field] = value;
							}
							update['profiles/'+user_id+'/'+field] = value;
							return rootRef.update(update);
						})


					})
				},
		
		friends:	function(user_id){
					var ref = firebase.database().ref().child("friends").child(user_id);
					var syncObject = $firebaseObject(ref);
					return syncObject;
				},

		friendspost:	function(user,friend){
						date = new Date();
						var ref = firebase.database().ref().child("friends").child(user.uid).child("outbound").child(friend.$id).set({"username":friend.username, "image":friend.image, "accepted":true, "inserted_at":date.getTime()});
						var ref = firebase.database().ref().child("friends").child(friend.$id).child("inbound").child(user.uid).set({"username":user.profile_details.username, "image":user.profile_details.image, "accepted":false, "inserted_at":date.getTime()});
						
						return ref;

					},

		frienddelete:	function(user_id,friend_id){
			console.log(user_id)
			console.log(friend_id)
						var ref = firebase.database().ref().child("friends").child(user_id).child("outbound").child(friend_id).remove();
						var ref = firebase.database().ref().child("friends").child(friend_id).child("inbound").child(user_id).remove();
						return ref;
					},
					
		boadgames:	function(query, limit, orderingField, endAt, endAtKey){
				if(query!=""){
					var ref = firebase.database().ref().child("boardgames").orderByChild("search_name").startAt(query).limitToFirst(limit);
				}
				else{
					if(orderingField == "search_name"){
							var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).limitToFirst(limit);
					}
					else{
							console.log("cio");
						if(endAtKey == ""){
							console.log(endAt);
							console.log(endAtKey);
							var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).endAt(endAt).limitToLast(limit);
						}
						else{
							var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).endAt(endAt, endAtKey).limitToLast(limit);
						}
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
						var ref = firebase.database().ref().child("designers").child(id);
						var syncObject = $firebaseObject(ref);
						return syncObject;
					},

		category: function(id, query){
				if(query != "")
					var ref = firebase.database().ref().child("categories").child(id).child("boardgames").orderByChild("name").startAt(query).limitToFirst(20);
				else
					var ref = firebase.database().ref().child("categories").child(id).child("boardgames").orderByChild("name").limitToFirst(20);
				var syncarray = $firebaseArray(ref);
				return syncarray;
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
		
		matchpost:	function(values, simpleObject, match_played){
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
							"last_inserted_at":values.inserted_at,
						})
					}

					return syncObject;
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

		matchput:function(completed, bggId, players, match_id, winner){
						update = {
							"completed": completed,
							"winner": (completed)? winner : ""
						}
						var ref = firebase.database().ref();

						obj = ref.child("matches").child(""+match_id).update(update);

						for(k in players){
							ref.child("user_played_matches")
							.child(""+players[k].uid)
							.child(""+bggId)
							.child("matches")
							.child(""+match_id)
							.update(update);
						}
						return obj;
					},
					
		playpost:	function(match, plays){
					var ref = firebase.database().ref().child("matches").child(""+match).child("plays").push(plays);
					var syncObject = $firebaseObject(ref);
					return syncObject;
					},
		
		templates:	function(boardgame){
			var ref = firebase.database().ref().child("boardgame_has_templates").child(""+boardgame);
			var syncArray = $firebaseArray(ref);
			return syncArray;
					},

		user_templates:	function(uid){
			var ref = firebase.database().ref().child("user_posted_templates").child(uid);
			var syncArray = $firebaseArray(ref);
			return syncArray;
					},
		
		templatespost:	function(boardgame, user, template){
			var ref = firebase.database().ref().child("boardgame_has_templates").child(""+boardgame.bggId).push(template);
			var syncObject = $firebaseObject(ref);
			template["boardgame"] = {}
			template["boardgame"]["bggId"] = boardgame["bggId"]
			template["boardgame"]["name"] = boardgame["name"]
			template["boardgame"]["search_name"] = boardgame["search_name"]
			template["boardgame"]["image"] = boardgame["image"]
			template["boardgame"]["thumbnail"] = boardgame["thumbnail"]
			var ref = firebase.database().ref().child("user_posted_templates").child(""+user).child(syncObject.$id).set(template);

			return syncObject;
					},

		templateput:	function(boardgame, template_id, template, user_id){
			var ref = firebase.database().ref().child("boardgame_has_templates").child(""+boardgame).child(template_id).update(template);
			if(template_id != "0")
			var ref = firebase.database().ref().child("user_posted_templates").child(user_id).child(template_id).update(template);
					},				
		
	}
});