//controller for the single match page
angular.module("play").controller('matchController', function(Api, $window, $timeout, $routeParams, $location, $mdDialog, $rootScope, $scope) {
	this.fabOpen = false;
	this.editMode = false;
	this.anim = "md-scale";
	this.statusColor = "";

	//read the requested match'id
	this.params=$routeParams;
	this.match={};
	this.allVisible=false;
	this.timer;
	this.loadedLeaderboard = false;
	this.plays = {};
	controller=this;

	dbMatch = Api.match(controller.params.id);
	dbMatch.$bindTo($scope, "match");

	dbMatch.$loaded().then(
		function(response){
			controller.plays = response.plays;
			console.log(controller.plays)
			
		}, function errorCallback(response){
			$rootScope.showToast("You are not allowed to see this match!");
			//$location.path("matches/");			
		}
	);
	
	
	this.updateScore = function(play_id, detailed_point_id, val){
		prev = $scope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"];
		update = val-prev;
		$scope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"] = val;
		controller.plays[play_id]["points"] += update;
		$scope.match.plays[play_id]["points"] += update;
		$scope.match.players[$scope.match.plays[play_id]["user"]]["points"] += update;
	}
	//this.sumPointsPerPlay = function(detailedPoints){
	//	sum = 0;
	//	for(k = 0; k< detailedPoints.length; k++){
	//		sum += detailedPoints[k].detailed_points*controller.match.scoringFieldObj[detailedPoints[k].scoringField].bonus;
	//	}
	//	return sum;
	//}
//
	//this.sumPointsPerUser = function(detailedPoints){
	//	sum = 0;
	//	for(dp in detailedPoints){
	//		sum += detailedPoints[dp].detailed_points*detailedPoints[dp].bonus;
	//	}
	//	return sum;
	//}

	this.setVisible = function(i){
		if(controller.plays[i].visible)
			controller.plays[i].visible = !controller.plays[i].visible;
		else
			controller.plays[i].visible = true;
	}

	//this.setLeaderboardVisible = function(user){
	//	controller.allVisible = false;
	//	controller.match.leaderboard[user].visible = !controller.match.leaderboard[user].visible;
	//}
//
	//this.startEditMode = function($event){
	//	controller.editMode = true;
	//	controller.fabOpen = true;
	//	controller.allVisible = true;
	//}
//
	//this.endEditMode = function(wantToSave){
	//	controller.editMode = !controller.editMode;
	//	if(wantToSave){
	//		controller.savePoints();
	//		row={
	//			duration:controller.match.duration,
	//			boardgame:controller.match.boardgame,
	//			location:controller.match.location,
	//			time:controller.match.time,
	//			name:controller.match.name,
	//			status:controller.match.status,
	//			winner: controller.getWinner()
	//			}
//
	//		Api.matchput(row, controller.match.pk).then(function(data){
	//			controller.match.old_location = controller.match.location;
	//			controller.match.old_duration = controller.match.duration;
	//			controller.match.old_time = controller.match.time;
	//			controller.match.old_name = controller.match.name;
	//		}, 
	//		function errorCallback(response) {
	//		});
//
//
	//		$rootScope.showToast("Match successfully edited!");
	//	}
	//	else{
	//		controller.match.location = controller.match.old_location;
	//		controller.match.time = controller.match.old_time;
	//		controller.match.name = controller.match.old_name;
	//		for(i = 0; i<controller.match.plays_set.length; i++){
	//			play_pk = controller.match.plays_set[i].pk;
	//			for(j = 0; j<controller.match.plays_set[i].detailedPoints.length; j++){
	//				old_points = controller.match.plays_set[i].detailedPoints[j].old_detailed_points;
	//				new_points = controller.match.plays_set[i].detailedPoints[j].detailed_points;
	//				if(old_points != new_points){
	//					controller.match.plays_set[i].detailedPoints[j].detailed_points = old_points;
	//				}
	//			}
	//		}
	//		controller.allVisible = false;
	//		controller.managePlays();
	//	}
	//	controller.detectStatus();
	//}
//
	//this.deleteMatchPopup = function(ev){
	//	var confirm = $mdDialog.confirm()
    //      .title('Would you like to delete this match?')
    //      .targetEvent(ev)
    //      .ok('Yes!')
    //      .cancel('No');
//
	//    $mdDialog.show(confirm).then(function() {
	//    	Api.matchdelete(controller.match.pk).then(function(data){
	//    			$rootScope.showToast("Match successfully removed!");
	//    			$location.path("matches/");
	//			}, 
	//			function errorCallback(response) {
	//				return;
	//			});
	//    }, function() {
	//      $scope.status = 'You decided to keep your debt.';
	//    });
	//}

	//this.setup = function(){
	//	controller.match.old_location = controller.match.location;
	//	controller.match.old_duration = controller.match.duration;
	//	controller.match.time = new Date(controller.match.time);
	//	controller.match.old_time = new Date(controller.match.time);
	//	controller.match.old_name = controller.match.name;
	//	if(controller.match.location == ""){
	//		controller.match.location = "No location";
	//	}
	//	controller.match.scoringFieldObj = {}
	//	for(sf in controller.match.scoring_fields_details){
	//		controller.match.scoringFieldObj[controller.match.scoring_fields_details[sf].pk] = controller.match.scoring_fields_details[sf];
	//	}
	//	for(play in controller.match.plays_set){
	//		controller.match.plays_set[play].detailedPointsObj = {}
	//		for(dp in controller.match.plays_set[play].detailedPoints){
	//			controller.match.plays_set[play].detailedPointsObj[controller.match.plays_set[play].detailedPoints[dp].scoringField] = controller.match.plays_set[play].detailedPoints[dp];
	//		}
	//	}
	//	controller.managePlays();
	//	controller.detectStatus();
	//	controller.loadedLeaderboard = true;
	//	startTime();
	//}

	//this.managePlays = function(){
	//	controller.match.totalTurns = 0;
	//	controller.match.leaderboard = {};
	//	for(i = 0; i< controller.match.plays_set.length;i++){
	//		play = controller.match.plays_set[i];
	//		if(!(play.user in controller.match.leaderboard)){
	//			controller.match.leaderboard[play.user] = {pk: play.user, visible: false, username: play.user_details.username, detailedPoints:{}}
	//		}
//
	//		if(play.turn > controller.match.totalTurns){
	//			controller.match.totalTurns = play.turn;
	//		}
//
//
	//		for(j = 0; j<play.detailedPoints.length; j++){
	//			if(!(play.detailedPoints[j].scoringField in controller.match.leaderboard[play.user]["detailedPoints"])){
	//				controller.match.leaderboard[play.user]["detailedPoints"][play.detailedPoints[j].scoringField] = {}
	//				controller.match.leaderboard[play.user]["detailedPoints"][play.detailedPoints[j].scoringField]["detailed_points"] = play.detailedPoints[j].detailed_points;
	//				controller.match.leaderboard[play.user]["detailedPoints"][play.detailedPoints[j].scoringField]["bonus"] = controller.match.scoringFieldObj[play.detailedPoints[j].scoringField].bonus;
	//				controller.match.leaderboard[play.user]["detailedPoints"][play.detailedPoints[j].scoringField]["word_value"] = controller.match.scoringFieldObj[play.detailedPoints[j].scoringField].word_value;
	//			}
	//			else{
	//				controller.match.leaderboard[play.user]["detailedPoints"][play.detailedPoints[j].scoringField]["detailed_points"] += play.detailedPoints[j].detailed_points;
	//			}
	//			play.detailedPoints[j].old_detailed_points = play.detailedPoints[j].detailed_points;
	//		}
//
	//		controller.match.leaderboardArray= []
	//		for(user in controller.match.leaderboard) {
	//		    controller.match.leaderboardArray.push(controller.match.leaderboard[user]);
	//		}
//
	//		play.points = controller.sumPointsPerPlay(play.detailedPoints);
	//		controller.match.leaderboard[play.user].points = controller.sumPointsPerUser(controller.match.leaderboard[play.user].detailedPoints);
	//	}
	//}

	//this.detectStatus = function(){
	//	var now = new Date();
	//	if(now < new Date(controller.match.time)){
	//		controller.statusColor = "md-primary";
	//		controller.match.statusMessage = "programmed";
	//	}
	//	else if(controller.match.status == 0){
	//		controller.statusColor = "md-accent";
	//		controller.match.statusMessage = "in progress";
	//	}
	//	else if(controller.match.status == 1){
	//		$timeout.cancel(controller.timer);
	//		controller.match.statusMessage = "completed";
	//	}
	//	else{
	//		console.log(controller.match.statusMessage);
	//	}
	//}
//
	//this.setCompletionStatus = function(id){
	//	if(id != controller.match.status){
	//		row={
	//			boardgame:controller.match.boardgame,
	//			duration:controller.match.duration,
	//			status:id,
	//			winner: controller.getWinner()
	//			}
//
	//		Api.matchput(row, controller.match.pk).then(function(data){
	//				controller.match.status = id;
	//				controller.detectStatus();
	//				startTime();
	//			}, 
	//			function errorCallback(response) {
	//				console.log(response);
	//			});
	//	}
	//}

	//this.getWinner = function(){
	//	winner_pk = null;
	//	winner_points = 0;
	//	for(i = 0; i<controller.match.leaderboardArray.length; i++){
	//		if(controller.match.leaderboardArray[i].points > winner_points){
	//			winner_pk = controller.match.leaderboardArray[i].pk;
	//			winner_points = controller.match.leaderboardArray[i].points;
	//		}	
	//	}
	//	return winner_pk;
	//}
//
//
	//this.is = function(message){
	//	return controller.match.statusMessage == message;
	//}
//
	//this.updateDuration = function(){
	//	$timeout.cancel(controller.timer);
	//    if(controller.match.old_duration != controller.match.duration){
	//		row={
	//			boardgame:controller.match.boardgame,
	//			duration:controller.match.duration,
	//			status:controller.match.status
	//			}
//
	//		Api.matchput(row, controller.match.pk).then(function(data){	
	//			}, 
	//			function errorCallback(response) {
	//				console.log(response);
	//			});
	//	}
	//}

	//create ordered list of numbers
	this.range = function(a, b, step) {
		step = step || 1;
		var input = [];
		if(a>b){
		  for (var i = a; i >= b; i -= step) {
			input.push(i);
		  }
		}
		else{
		  for (var i = a; i <= b; i += step) {
			input.push(i);
		  }
		}
		return input;
	};

	//this.postPlay = function(){
	//	console.log(controller.match);
	//	controller.match.totalTurns++;
	//	plays = [];
	//	for(user in controller.match.leaderboard){
	//		plays.push({match:controller.match.pk, user:user, turn:controller.match.totalTurns})
	//	}
	//	console.log(plays);
	//	//post play
	//	Api.playpost(plays).then(
	//		function(response){
	//			controller.play = response.data;
	//			controller.postDetailedPoints();
	//		},
	//		function errorCallback(response){
	//		}
	//	);
	//}

	function startTime() {
		if(controller.match.statusMessage != "programmed" && controller.match.statusMessage != "completed"){
		    controller.match.duration ++;
		    controller.timer = $timeout(startTime, 1000);
		}
	}

	function checkTime(i) {
	    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	    return i;
	}


	$window.onbeforeunload =  controller.updateDuration;

	$scope.$on('$destroy', function(){
	    controller.updateDuration();
	});
});