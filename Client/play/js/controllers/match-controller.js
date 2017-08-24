 //controller for the single match page
angular.module("play").controller('matchController', function(Api, Utils, $window, $timeout, $filter, $routeParams, $location, $mdDialog, $rootScope, $rootScope) {
	this.fabOpen = false;
	this.editMode = false;
	this.anim = "md-scale";
	this.statusColor = "";

	//read the requested match'id
	this.params=$routeParams;
	controller=this;

	this.timer;

	this.plays = {};
	this.dbMatch = Api.match(controller.params.id);

	this.dbMatch.$bindTo($rootScope, "match");

	this.dbMatch.$ref().on('value',displayPlay);
	
var foo = {n: 1};


	function displayPlay(response){
			var m = response.val();
			controller.loaded = true;
			if($rootScope.user.uid in m.players){
				controller.allowed = true;
			}
			controller.time = new Date(m.time);
			controller.plays = m.plays;
			controller.total_rounds = $filter('keylength')(controller.plays)/$filter('keylength')(m.players);
	}

	this.updateScore = function(play_id, detailed_point_id, val){
		prev = $rootScope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"];
		update = val-prev;
		
		$rootScope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"] = val;
		controller.plays[play_id]["points"] += update;
		$rootScope.match.plays[play_id]["points"] += update;
		$rootScope.match.players[$rootScope.match.plays[play_id]["user"]]["points"] += update;
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
		$rootScope.match.time = controller.time.getTime();
		controller.editMode = !controller.editMode;
	}
	
	this.deleteMatchPopup = function(ev){
		var confirm = $mdDialog.confirm()
	      .title('Would you like to delete this match?')
	      .targetEvent(ev)
	      .ok('Yes!')
	      .cancel('No');
	
	    $mdDialog.show(confirm).then(function() {
	    	Api.matchdelete($rootScope.match.boardgame.bggId, $rootScope.match.players, $rootScope.match.$id)
	    	.then(function(data){
	    			$rootScope.showToast("Match successfully removed!");
	    			$location.path("matches/");
				}, 
				function errorCallback(response) {
					return;
				});
	    });
	}

	this.setCompletionStatus = function(completed){
		if($rootScope.match.completed != completed)
			winner = Utils.getMax($rootScope.match.players, "points");
			Api.matchput(completed, $rootScope.match.boardgame.bggId, $rootScope.match.players, $rootScope.match.$id,winner);
	}

	//create ordered list of numbers
	this.range = Utils.range

	this.postPlay = function(){
		for(player in $rootScope.match.players){
			play = {}
			play["user"] = player;
			play["round"] = this.total_rounds+1;
			play["detailed_points"] = {};
			play["points"] = 0;

			for(j in $rootScope.match.template.scoring_fields){
				scoring_field = $rootScope.match.template.scoring_fields[j];
				play["detailed_points"][j] = scoring_field;
				play["detailed_points"][j]["points"] = 0;
			}
			play_post = Api.playpost($rootScope.match.$id, play);
			play_post.$loaded().then(function(response){
				controller.plays = $rootScope.match.plays;
			})

		}
		controller.total_rounds += 1;
	}

	this.managePlayers = function(){
		dialog = $rootScope.showPopup("", $rootScope.user.uid, 'manageplayers', {'match': $rootScope.match, 'rounds': controller.total_rounds});
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


	//$window.onbeforeunload =  controller.updateDuration;

	$rootScope.$on('$locationChangeStart', function(){
	   console.log("son fora");
		controller.dbMatch.$destroy();
	   //controller.updateDuration();
	});
});