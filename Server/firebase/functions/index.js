const functions = require('firebase-functions');
var admin = require("firebase-admin");

var serviceAccount = require("./play-4fd54-firebase-adminsdk-qjpvd-aa91cb3eb8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://play-4fd54.firebaseio.com/"
});

exports.updateImages = functions.database.ref('profiles/{user_id}').onWrite(event => {
    var eventSnapshot = event.data;
    const user_id = event.params.user_id;
    const root = eventSnapshot.ref.root;
    const image = eventSnapshot.child('image');
    if (image.changed()) {
    	value = image.val();
		user_matches_ref = root.child("user_played_matches").once("value");
		friends_ref = root.child("friends").child(user_id).once("value");

		return Promise.all([user_matches_ref, friends_ref]).then(results=>{
			user_matches = results[0].val();
			friends = results[1].val();
			for(u in user_matches){
				user = user_matches[u];
				for(g in user){
					game = user[g];
					for(m in game.matches){
						match = game.matches[m];
						match_ref  = root.child('user_played_matches/'+u+'/'+g+'/matches/'+m+'/players/'+user_id).once("value").then(result=>{
							if(result.val().uid == user_id){
								root.child('matches/'+m+'/players/'+user_id+'/image').set(value);
								root.child('user_played_matches/'+u+'/'+g+'/matches/'+m+'/players/'+user_id+'/image').set(value);
							}
						});
						
					}
				}
			}
			if("outbound" in friends){
				for(f in friends["outbound"]){
					root.child('friends/'+f+'/inbound/'+user_id+'/image').set(value);
				}
			}
			if("inbound" in friends){
				for(f in friends["inbound"]){
					root.child('friends/'+f+'/outbound/'+user_id+'/image').set(value);
				}
			}

			return "Writing ok";
		})
    }
});

exports.addUserInDb = functions.auth.user().onCreate(event => {
  	const user = event.data; // The Firebase user
  	const username = user.email.split("@")[0];
  	var db = admin.database();
  	var db_ref = db.ref()
	obj = {}
	obj.username = username;
	obj.search_username = username.toLowerCase();
	obj.image = '';
	obj.visibility_group = 0;
	obj.fav_setting = true;
	obj.rec_setting = false;

 	return db_ref.child('profiles').child(user.uid).set(obj);
});


exports.removeUserFromDb = functions.auth.user().onDelete(event => {
  	const user = event.data; // The Firebase user
  	var db = admin.database();
  	var db_ref = db.ref()

 	return db_ref.child('profiles').child(user.uid).remove();
});