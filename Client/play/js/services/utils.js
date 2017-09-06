angular.module("play")
.factory('Utils', function(Api, $rootScope, $location, $mdDialog, $mdToast, $mdSidenav, $window, $routeParams){
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
				locals:{user_pk : user_pk, boardgame: boardgame, additional_field:additional_field},
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
			  	rnd = Math.floor(Math.random()*16);
			  	colors = ['#3949AB', '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00', '#F4511E', '#e53935', '#D81B60', '#8E24AA', '#5E35B1']
				$rootScope.randomColors[pk] = {'background-color':colors[rnd]};
			}

			obj.showToast = function(string){
			  $mdToast.show(
				  $mdToast.simple()
				  .textContent(string)
				  .hideDelay(3000)
				  .position('top right')
			  );
			}


			obj.updateCommonMatches = function(){
				controller.common_matches = [];
				console.log($rootScope.games);
				for(g in $rootScope.games){
					controller.common_matches[g] = {}
					for(c in $rootScope.games[g]){
						if(c != "matches")
							controller.common_matches[g][c] = $rootScope.games[g][c];
						else{
							controller.common_matches[g].matches = {}
							for(m in $rootScope.games[g].matches){
								console.log($rootScope.games[g].matches[m])
								if($routeParams.id in $rootScope.games[g].matches[m].players)
									controller.common_matches[g].matches[m] = $rootScope.games[g].matches[m];
							}
						}
					}
				}
			}


			obj.updateUserStats = function(data){
                $rootScope.games=data.val();
				match_played = 0;
				match_finished = 0;
				match_won = 0;
				most_played_game = "-";
				most_played_game_amount = 0;
                companions = {};


                $rootScope.chart = {};
                $rootScope.chart.games = {};
                $rootScope.chart.games["labels"] = [];
                $rootScope.chart.games["values"] = [];
                $rootScope.chart.companions = {}
				$rootScope.chart.companions["labels"] = []
				$rootScope.chart.companions["values"] = {}
				$rootScope.chart.companions["values"]["won"] = []
				$rootScope.chart.companions["values"]["played"] = []
                if($rootScope.games){

                    for(i in $rootScope.games){
						game = $rootScope.games[i];
						if(game){
							game.visible = false;
							game.lastMatchTime = 0;
							if(game.matches){
								played_matches = Object.keys(game.matches);

		                		$rootScope.chart.games["labels"].push(game.name);
		                		$rootScope.chart.games["values"].push(played_matches.length);
								
								//get most played game
								if(played_matches.length > most_played_game_amount){
									most_played_game_amount = played_matches.length;
									most_played_game = game.name;
								}

								for(m in game.matches){
									match = game.matches[m];
									game.lastMatchTime = Math.max(game.lastMatchTime, match.time);
									
									//get finished, won and played matches
									if(match.completed){
										match_finished++; 
										if($rootScope.user.uid in match.winner)
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
						}
					}
                }
                for(c in companions){
                	$rootScope.chart.companions["labels"].push(companions[c].username);
                	$rootScope.chart.companions["values"]["played"].push(companions[c].amount);
                	$rootScope.chart.companions["values"]["won"].push(companions[c].won);
                }
				$rootScope.profile_stats = {}
				$rootScope.profile_stats.match_played = match_played;
				$rootScope.profile_stats.match_won = match_won;
				$rootScope.profile_stats.match_finished = match_finished;
				$rootScope.profile_stats.most_played_game = most_played_game;
				$rootScope.profile_stats.most_played_game_amount = most_played_game_amount;
				$rootScope.profile_stats.most_frequent_companion = companions;
			};



			obj.getUserMatches = function(data){
				//$rootScope.games.$watch(function() {
				//  obj.updateUserStats();
				//});
				var array = $.map(data, function(value, index) {
				    return [value];
				});
				obj.updateUserStats(array);
			}	

			obj.watchMatches = function(newData, oldData){
				console.log(newData)
			}

			obj.playNewFriendNotification = function(newData, oldData) {
			  if(oldData){
				if((!oldData.hasOwnProperty('inbound') 
					&& newData.hasOwnProperty('inbound')) 
				  || 
				  (oldData.hasOwnProperty('inbound') 
					  && newData.hasOwnProperty('inbound')
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

			obj.logout = function(){
				firebase.auth().signOut().then(function() {
					$window.location.reload();
				  // Sign-out successful.
				}, function(error) {
				  // An error happened.
				});
			}
	return obj;
});