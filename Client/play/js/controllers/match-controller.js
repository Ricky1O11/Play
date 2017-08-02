//controller for the single match page
angular.module("play").controller('matchController', function(Api, $window, $timeout, $filter, $routeParams, $location, $mdDialog, $rootScope, $scope) {
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

	dbMatch.$loaded().then(
		function(response){
			controller.plays = response.plays;
			controller.total_rounds = $filter('keylength')(controller.plays)/$filter('keylength')(response.players);
			console.log(controller.total_rounds)
		}, function errorCallback(response){
			$rootScope.showToast("You are not allowed to see this match!");
			//$location.path("matches/");			
		}
	);
	
	dbMatch.$bindTo($scope, "match");
	
	this.updateScore = function(play_id, detailed_point_id, val){
		prev = $scope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"];
		update = val-prev;
		$scope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"] = val;
		controller.plays[play_id]["points"] += update;
		$scope.match.plays[play_id]["points"] += update;
		$scope.match.players[$scope.match.plays[play_id]["user"]]["points"] += update;
	}

	this.setVisible = function(i){
		if(controller.plays[i].visible)
			controller.plays[i].visible = !controller.plays[i].visible;
		else
			controller.plays[i].visible = true;
	}

	this.startEditMode = function($event){
		controller.editMode = true;
		controller.fabOpen = true;
	}

	this.endEditMode = function(wantToSave){
		controller.editMode = !controller.editMode;
	}
	
	this.deleteMatchPopup = function(ev){
		var confirm = $mdDialog.confirm()
	      .title('Would you like to delete this match?')
	      .targetEvent(ev)
	      .ok('Yes!')
	      .cancel('No');
	
	    $mdDialog.show(confirm).then(function() {
	    	Api.matchdelete($scope.match.boardgame.bggId, $scope.match.players, $scope.match.$id)
	    	.then(function(data){
	    			$rootScope.showToast("Match successfully removed!");
	    			$location.path("matches/");
				}, 
				function errorCallback(response) {
					return;
				});
	    });
	}


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

	this.postPlay = function(){
		for(player in $scope.match.players){
			play = {}
			play["user"] = player;
			play["round"] = this.total_rounds+1;
			play["detailed_points"] = {};
			play["points"] = 0;

			for(j in $scope.match.template.scoring_fields){
				scoring_field = $scope.match.template.scoring_fields[j];
				play["detailed_points"][j] = scoring_field;
				play["detailed_points"][j]["points"] = 0;
			}
			play_post = Api.playpost($scope.match.$id, play);
			play_post.$loaded().then(function(response){
				controller.plays = $scope.match.plays;
				
			})
			console.log(controller.plays)

		}
		controller.total_rounds += 1;
	}

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
	    //controller.updateDuration();
	});
});