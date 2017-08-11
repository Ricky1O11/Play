angular.module("play")
.factory('Utils', function(Api, $rootScope, $location, $mdDialog, $mdToast, $mdSidenav){
  obj = {};
			obj.toggleFavourite = function(boardgame) {
			  date = new Date();
					if("favourites" in $rootScope.user["profile_details"]){
					  if(boardgame.bggId in $rootScope.user["profile_details"]["favourites"]){
						delete $rootScope.user["profile_details"]["favourites"][boardgame.bggId];
					  }
					  else{
						$rootScope.user["profile_details"]["favourites"][boardgame.bggId] = {
						  "name": boardgame.name,
						  "image": boardgame.image,
						  "bggId": boardgame.bggId,
						  "inserted_at": date.getTime()
						}
					  }
					}
					else{
					  $rootScope.user["profile_details"]["favourites"] = {};
					  $rootScope.user["profile_details"]["favourites"][boardgame.bggId] = {
						  "name": boardgame.name,
						  "image": boardgame.image,
						  "bggId": boardgame.bggId,
						  "inserted_at": date.getTime()
						}
					}
			}
		  
			obj.timestampToDate = function(timestamp){
				return date = new Date(timestamp*1000);
				// Hours part from the timestamp
				var hours = date.getHours();
				// Minutes part from the timestamp
				var minutes = "0" + date.getMinutes();
				// Seconds part from the timestamp
				var seconds = "0" + date.getSeconds();

				// Will display time in 10:30:23 format
				var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
			}

			obj.getMax = function(array, field){
			  max = 0;
			  id = "";

			  for(i in array){
				if(array[i][field] > max){
				  max = array[i][field];
				  id = ""+i;
				}
			  }
			  return id;
			}

			obj.range = function(min, max, step) {
			  step = step || 1;
			  var input = [];
			  for (var i = min; i <= max; i += step) {
				input.push(i);
			  }
			  return input;
			}

			obj.goTo = function(url, id) {
			  if(id >=0){
				url += id
			  }
			  $location.path(url);
			}

			obj.showPopup = function(ev, user_pk, string, additional_field) {
			  boardgame = additional_field? additional_field : -1;
			  $mdDialog.show({
				locals:{user_pk : user_pk, boardgame: boardgame},
				controller: string+'DialogController',
				controllerAs: string.substring(0,1)+'dCtrl',
				templateUrl: 'templates/'+string+'dialog.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				scope:$rootScope,
				preserveScope:true, 
				//fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			  })  
			}

			obj.showImage = function(ev, url) {
			  $mdDialog.show({
				locals:{url : url},
				controller: 'imageDialogController',
				controllerAs: 'iCtrl',
				templateUrl: 'templates/imagedialog.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				scope:$rootScope,
				preserveScope:true, 
				clickOutsideToClose:true,
				//fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
			  })  
			}

			obj.getRandomColor = function(pk){
			  rnd = Math.floor(Math.random()*7);
			  switch (rnd){
				case 0: $rootScope.randomColors[pk] = {'background-color':'#448AFF'}; break; //blue
				case 1: $rootScope.randomColors[pk] = {'background-color':'#FF5252'}; break; //red
				case 2: $rootScope.randomColors[pk] = {'background-color':'#7C4DFF'}; break; //deep purple
				case 3: $rootScope.randomColors[pk] = {'background-color':'#4DB6AC'}; break; //teal
				case 4: $rootScope.randomColors[pk] = {'background-color':'#FF9800'}; break; //orange
				case 5: $rootScope.randomColors[pk] = {'background-color':'#4DD0E1'}; break; //cyan
				case 6: $rootScope.randomColors[pk] = {'background-color':'#F06292'}; break; //pink
				default: $rootScope.randomColors[pk] = {'background-color':'#FFD740'}; break; //amber
			  }
			}

			obj.showToast = function(string){
			  $mdToast.show(
				  $mdToast.simple()
				  .textContent(string)
				  .hideDelay(3000)
				  .position('top right')
			  );
			}

			obj.getUserMatches = function(data){
			  $rootScope.games=data;
			  match_played = 0;
			  match_finished = 0;
			  match_won = 0;
			  most_played_game = "";
			  most_played_game_amount = 0;

			  companions = {};

			  for(i = 0; i< $rootScope.games.length; i++){
				game = $rootScope.games[i];
				game.visible = false;
				game.lastMatchTime = 0;

				//get most played game
				played_matches = Object.keys(game.matches);
				if(played_matches.length >most_played_game_amount){
				  most_played_game_amount = played_matches;
				  most_played_game = game.name;
				}

				for(m in game.matches){
				  match = game.matches[m];
				  game.lastMatchTime = Math.max(game.lastMatchTime, match.time);
				  
				  //get finished, won and played matches
				  if(match.completed){
					match_finished++; 
					if(match.winner == $rootScope.user.uid)
					  match_won++;
				  }
				  match_played++;

				  for(p in match.players){
					player = match.players[p];
					if(p != $rootScope.user.uid){
						if(p in companions){
							companions[p]["amount"] += 1
							if(match.winner == $rootScope.user.uid)
								if("won" in companions[p])
									companions[p]["won"] += 1
								else
									companions[p]["won"] = 1
						}
						else{
							companions[p] = {}
							companions[p]["amount"] = 1
							if(match.winner == $rootScope.user.uid)
								companions[p]["won"] = 1
							else{
								companions[p]["won"] = 0
							}
							companions[p]["username"] = player.username;
							companions[p]["image"] = player.image;
					 	}
					}
				  }

				}
			  }

			  $rootScope.user.profile_details.match_played = match_played;
			  $rootScope.user.profile_details.match_won = match_won;
			  $rootScope.user.profile_details.match_finished = match_finished;
			  $rootScope.user.profile_details.most_played_game = most_played_game;
			  $rootScope.user.profile_details.most_played_game_amount = most_played_game_amount;
			  $rootScope.user.profile_details.most_frequent_companion = companions;
			}

			obj.playNewFriendNotification = function(newData, oldData) {
			  if(oldData){
				if((oldData.inbound == null 
					&& newData.inbound != null) 
				  || 
				  (oldData.inbound != null 
					  && newData.inbound != null 
					  && Object.keys(oldData.inbound).length < Object.keys(newData.inbound).length)){
					var audio = new Audio('audio/song.mp3');
						audio.play();
				}
			  }
			}

			obj.addFriend = function(user){
			  Api.friendspost($rootScope.user, user).then(function(response){
				$rootScope.showToast("Good job! You have a new friend!");
			  }, function errorCallback(response){
			  });
			}

			obj.removeFriend = function(user_id){
				if("outbound" in $rootScope.user.friends && user_id in $rootScope.user.friends.outbound){
					Api.frienddelete($rootScope.user.uid, user_id, "out").then(function(response){
						$rootScope.showToast("What a pity! You lose a companion");
					}, function errorCallback(response){
					});
				}
				else{
					Api.frienddelete($rootScope.user.uid, user_id, "in").then(function(response){
						$rootScope.showToast("What a pity! You lose a companion");
					}, function errorCallback(response){
					});
				}
			}

			obj.acceptFriend = function(friend_id) {
				$rootScope.user.friends.inbound[friend_id].accepted = true;
				Api.friendput(friend_id, $rootScope.user.uid);
			}

			obj.uploadImage = function(blob) {
				time = new Date();
				fileName = $rootScope.user.uid + "_" + time.getTime();
				var storageRef = firebase.storage().ref();
				var fileRef = storageRef.child("images").child("avatar").child($rootScope.user.uid).child(fileName);
				fileRef.put(blob).then(function(snapshot) {
					firebase.storage().ref().child('images/avatar/'+$rootScope.user.uid+'/'+fileName).getDownloadURL().then(function(url) {
				  		Api.userput($rootScope.user.uid, "image", url);
					}).catch(function(error) {
					  // Handle any errors
					});
				});
			}

			obj.showNotifications = function() {
				$mdSidenav("right").toggle();
			}

			obj.changeLetter = function(i) {
			    if (122 == i.charCodeAt(0)) {
		            result = "zz";
		        // handle "Z"
		        } else if (90 == i.charCodeAt(0)) {
		            result += "zz";
		        // handle all other letter characters
		        } else if ((65 <= i.charCodeAt(0) && i.charCodeAt(0) <= 89) ||
		                   (97 <= i.charCodeAt(0) && i.charCodeAt(0) <= 121)) {
		            result = String.fromCharCode(i.charCodeAt(0) + 1);
		        // append all other characters unchanged
		        } else {
		            result = i;
		        }
			    return result;
			}
	return obj;
});