 angular.module('play')
.factory('Api', function ApiFactory($firebaseObject, $firebaseArray){
	return{
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
					user_ref = firebase.database().ref().child("profiles").child(user_id)
					update = {};
					update[field] = value;
					console.log(user_id)
					console.log(update)
					return user_ref.update(update);
				},
		
		friends:	function(user_id){
					var ref = firebase.database().ref().child("friends").child(user_id);
					var syncObject = $firebaseObject(ref);
					return syncObject;
				},

		friendspost:	function(user,friend){
					date = new Date();
					var ref = firebase.database().ref().child("friends").child(user.uid).child("outbound").child(friend.$id).set({"username":friend.username, "image":friend.image, "accepted":false, "inserted_at":date.getTime()});
					var ref = firebase.database().ref().child("friends").child(friend.$id).child("inbound").child(user.uid).set({"username":user.profile_details.username, "image":user.profile_details.image, "accepted":false, "inserted_at":date.getTime()});
					
					return ref;
				},

		frienddelete:	function(user_id,friend_id, dir){
					if(dir == "out"){
						var ref = firebase.database().ref().child("friends").child(user_id).child("outbound").child(friend_id).remove();
						var ref = firebase.database().ref().child("friends").child(friend_id).child("inbound").child(user_id).remove();
						return ref;
					}
					else{
						var ref = firebase.database().ref().child("friends").child(friend_id).child("outbound").child(user_id).update({"accepted":false});
						var ref = firebase.database().ref().child("friends").child(user_id).child("inbound").child(friend_id).update({"accepted":false});
						return ref;
					}
				},

		friendput:	function(friend_id, user_id){
					var ref = firebase.database().ref().child("friends").child(friend_id).child("outbound").child(user_id).update({"accepted":true});
					return ref;
				},
					
		boadgames:	function(query, limit, orderingField, endAt, endAtKey){
					if(query!=""){
						var ref = firebase.database().ref().child("boardgames").orderByChild("search_name").startAt(query).endAt(endAt).limitToFirst(limit);
					}
					else{
						if(orderingField == "search_name")
							var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).limitToFirst(limit);
						else{
							if(endAtKey == "")
								var ref = firebase.database().ref().child("boardgames").orderByChild(orderingField).endAt(endAt).limitToLast(limit);
							else
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
		
		matchpost:	function(values, simpleObject){
					var ref = firebase.database().ref();
					matches_ref = ref.child("matches").push(values);
					var syncObject = $firebaseObject(matches_ref);

					var boardgame_has_matches_ref = ref.child("boardgame_has_matches")
					.child(""+values.boardgame.bggId)
					.child(""+syncObject.$id)
					.set(simpleObject);

					for(p in values.players){
						player = values.players[p];

						var user_played_matches_ref = ref.child("user_played_matches")
														.child(""+player.uid)
														.child(""+values.boardgame.bggId)
						update = {
								"name":values.boardgame.name,
								"thumbnail":values.boardgame.thumbnail,
								"image":values.boardgame.image,
								"bggId":values.boardgame.bggId,
								"last_inserted_at":values.inserted_at,
								};

						user_played_matches_ref.update(update)
						
						user_played_matches_ref
						.child("matches")
						.child(""+syncObject.$id)
						.set(simpleObject);

					}

					return syncObject;
					},

		matchdelete: function(bggId, players, match_id){
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

		matchput: function(completed, bggId, players, match_id, winner){
					var ref = firebase.database().ref();

					update = {
						"completed": completed,
						"winner": (completed)? winner : ""
					}

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

		playerpost:	function(match, simpleObject, player){
				 	delete simpleObject["$id"]
					delete simpleObject["$priority"]

					var ref = firebase.database().ref()
					var matches_ref = ref.child("matches").child(""+match.$id).child("players").child(player.uid).set(player);
					
					var players_ref = ref.child("matches").child(""+match.$id).child("players");

					players_ref.once('value').then(function(snapshot) {
						players = snapshot.val();

					  	for(p in players){
							var user_played_matches_ref = ref.child("user_played_matches")
														.child(""+players[p].uid)
														.child(""+match.boardgame.bggId)
							update = {
									"name":match.boardgame.name,
									"thumbnail":match.boardgame.thumbnail,
									"image":match.boardgame.image,
									"bggId":match.boardgame.bggId,
									"last_inserted_at":match.inserted_at,
									};

							user_played_matches_ref.update(update)

							user_played_matches_ref
							.child("matches")
							.child(""+match.$id)
							.set(simpleObject);
						}
					});

					return ref;
				},

		playerdelete:	function(match, player){
					var ref = firebase.database().ref()
					
					var matches_ref = ref.child("matches").child(""+match.$id).child("players").child(player.uid).remove()
					
					var plays_ref = ref.child("matches").child(""+match.$id).child("plays");
					plays_ref.once('value').then(function(snapshot) {
						plays = snapshot.val();
					  for(play in plays){
							if(plays[play].user == player.uid){
								ref.child("matches").child(""+match.$id).child("plays").child(play).remove()
							}
						}
					});

					var players_ref = ref.child("matches").child(""+match.$id).child("players");
						
					players_ref.once('value').then(function(snapshot) {
						players = snapshot.val();
						console.log(players)
					  	for(p in players){
							var user_played_matches_ref = ref.child("user_played_matches")
																.child(""+players[p].uid)
																.child(""+match.boardgame.bggId)
																.child("matches")
																.child(""+match.$id)
																.child("players")
																.child(player.uid)
																.remove();
						}
					});
					var user_played_matches_ref = ref.child("user_played_matches")
																.child(""+player.uid)
																.child(""+match.boardgame.bggId)
																.child("matches")
																.child(""+match.$id).
																remove();
					return $firebaseObject(plays_ref);
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