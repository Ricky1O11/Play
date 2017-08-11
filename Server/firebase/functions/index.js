const functions = require('firebase-functions');

exports.updateImages = functions.database.ref('profiles/{user_id}').onWrite(event => {
    var eventSnapshot = event.data;
    const user_id = event.params.user_id;
    const root = eventSnapshot.ref.root;
    const image = eventSnapshot.child('image');
    if (image.changed()) {
    	console.log("a")
    	value = image.val();
    	console.log(value)
		user_matches_ref = root.child("user_played_matches").once("value");
		friends_ref = root.child("friends").child(user_id).once("value");

		return Promise.all([user_matches_ref, friends_ref]).then(results=>{
    		console.log("b")
			user_matches = results[0].val();
    		console.log(user_matches)
			friends = results[1].val();
			for(u in user_matches){
    			console.log(u)
				user = user_matches[u];
				for(g in user){
					game = user[g];
					for(m in game.matches){
						match = game.matches[m];
    					console.log("c")
    					console.log(match)
						root.child('matches/'+m+'/players/'+user_id+'/image').set(value);
						root.child('user_played_matches/'+u+'/'+g+'/matches/'+m+'/players/'+user_id+'/image').set(value);
					}
				}
			}

			for(f in friends["outbound"]){
				console.log("d")
    			console.log(f)
				root.child('friends/'+f+'/inbound/'+user_id+'/image').set(value);
			}
			for(f in friends["inbound"]){
				root.child('friends/'+f+'/outbound/'+user_id+'/image').set(value);
			}

			return "Writing ok";
		})
    }
});