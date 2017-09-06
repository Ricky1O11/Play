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


	function displayPlay(response){
		var m = response.val();
		controller.loaded = true;
		if($rootScope.user.uid in m.players){
			controller.allowed = true;
		}
		controller.time = new Date(m.time);
		controller.plays = m.plays;

		if(m.template.playersOrganization == "all vs all")
			controller.total_rounds = $filter('keylength')(controller.plays)/$filter('keylength')(m.players);
		else
			controller.total_rounds = $filter('keylength')(controller.plays)/$filter('keylength')(m.teams);
	}
 
	this.updateScore = function(howToScore, play_id, detailed_point_id, val, bonus, field){
		if(howToScore == "win/lose"){
			$rootScope.match.plays[play_id]["round_winner"] = val;
			if(val)
				$rootScope.match[field][$rootScope.match.plays[play_id]["user"]]["points"] += 1;
			else
				$rootScope.match[field][$rootScope.match.plays[play_id]["user"]]["points"] -= 1;
		}
		else{
			let prev = $rootScope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"];
			update = val-prev;
			
			$rootScope.match.plays[play_id]["detailed_points"][detailed_point_id]["points"] = val;
			controller.plays[play_id]["points"] += update;
			$rootScope.match.plays[play_id]["points"] += update;
			$rootScope.match[field][$rootScope.match.plays[play_id]["user"]]["points"] += update;
		}
	}








	this.setVisible = function(i){
		if(controller.plays[i].visible)
			controller.plays[i].visible = !controller.plays[i].visible;
		else
			controller.plays[i].visible = true;
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
		if($rootScope.match.completed != completed){
			winner = {};

			if($rootScope.match.template.playersOrganization == "team based"){
				winnerTeam = Utils.getMax($rootScope.match.teams, "points");
				if($rootScope.match.teams[winnerTeam]["players"]){
					for(pl in $rootScope.match.teams[winnerTeam]["players"]){
						winner[pl] = true;
						Api.matchput(completed, $rootScope.match.boardgame.bggId, $rootScope.match.players, $rootScope.match.$id,winner);
					}
				}
			}
			else{
				winner[Utils.getMax($rootScope.match.players, "points")] = true;
				Api.matchput(completed, $rootScope.match.boardgame.bggId, $rootScope.match.players, $rootScope.match.$id, winner);
			}
		}
	}

	//create ordered list of numbers
	this.range = Utils.range

	this.postPlay = function(){
		console.log($rootScope.match.players);

		round = controller.total_rounds+1;
		if($rootScope.match.template.playersOrganization == "all vs all"){
			for(player in $rootScope.match.players){
				play = controller.preparePlay(player, round);
				play_post = Api.playpost($rootScope.match.$id, play);
				play_post.$loaded().then(function(response){
					controller.plays = $rootScope.match.plays;
				})
			}
		}
		else{
			for(team in $rootScope.match.teams){
				play = controller.preparePlay(team, round);
				play_post = Api.playpost($rootScope.match.$id, play);
				play_post.$loaded().then(function(response){
					controller.plays = $rootScope.match.plays;
				})
			}
		}
		controller.total_rounds += 1;
	}

	this.preparePlay = function(player, round){

		play = {}
		play["user"] = player;
		play["round"] = round;

		if($rootScope.match.template.howToScore == "win/lose"){
			play["round_winner"] = false;
		}
		else{
			play["detailed_points"] = {};
			play["points"] = 0;

			for(j in $rootScope.match.template.scoring_fields){
				scoring_field = $rootScope.match.template.scoring_fields[j];
				play["detailed_points"][j] = scoring_field;
				play["detailed_points"][j]["points"] = 0;
			}
		}
		return play;
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

	this.startEditMode = function($event){
		controller.editMode = true;
		controller.fabOpen = true;
	}

	this.endEditMode = function(wantToSave){
		$rootScope.match.time = controller.time.getTime();
		controller.editMode = !controller.editMode;
	}

	$rootScope.$on('$locationChangeStart', function(){
		controller.dbMatch.$destroy();
	   //controller.updateDuration();
	});
});