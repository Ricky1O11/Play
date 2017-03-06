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
	controller=this;
	//api call to get the single match's details
	Api.match(controller.params.id).then(
		function(response){
			if(response.data.length > 0){
				controller.match=response.data[0];
				controller.setup();
			}
			else{
				$rootScope.showToast("You are not allowed to see this match!");
		   		$location.path("matches/");	
			}
		}, function errorCallback(response){
			$rootScope.showToast("You are not allowed to see this match!");
		    //$location.path("matches/");			
		}
	);
	
	this.sumPoints = function(detailedPoints){
		sum = 0;
		for(k = 0; k< detailedPoints.length; k++){
			sum += detailedPoints[k].detailed_points;
		}
		return sum;
	}

	this.setVisible = function(pk){
		controller.allVisible = false;
		for(i = 0; i<controller.match.plays_set.length; i++){
			if(controller.match.plays_set[i].pk == pk){
				controller.match.plays_set[i].visible = !controller.match.plays_set[i].visible;
			}
		}
	}

	this.startEditMode = function($event){
		controller.editMode = true;
		controller.fabOpen = true;
		console.log(controller.editMode);
		console.log(controller.fabOpen);
		controller.allVisible = true;
	}

	this.endEditMode = function(wantToSave){
		controller.editMode = !controller.editMode;
		if(wantToSave){
			row={
				duration:controller.match.duration,
				boardgame:controller.match.boardgame,
				location:controller.match.location,
				time:controller.match.time,
				name:controller.match.name,
				status:controller.match.status
				}

			Api.matchput(row, controller.match.pk).then(function(data){
					controller.match.old_location = controller.match.location;
					controller.match.old_duration = controller.match.duration;
					controller.match.old_time = controller.match.time;
					controller.match.old_name = controller.match.name;
				}, 
				function errorCallback(response) {
				});

			for(i = 0; i<controller.match.plays_set.length; i++){
				play_pk = controller.match.plays_set[i].pk;
				for(j = 0; j<controller.match.plays_set[i].detailedPoints.length; j++){
					old_points = controller.match.plays_set[i].detailedPoints[j].old_detailed_points;
					new_points = controller.match.plays_set[i].detailedPoints[j].detailed_points;
					if(old_points != new_points){
						scoringField_pk = controller.match.plays_set[i].detailedPoints[j].scoringField;
						detailedPoints = controller.match.plays_set[i].detailedPoints[j].detailed_points;
						row = {
							play:play_pk,
							scoringField:scoringField_pk,
							detailed_points:detailedPoints
						};
						Api.dpPut(row, controller.match.plays_set[i].detailedPoints[j].pk).then(function(data){
							controller.allVisible = false;
							controller.managePlays();
						}, 
						function errorCallback(response) {
							return;
						});
					}
				}
			}
			$rootScope.showToast("Match successfully edited!");
		}
		else{
			controller.match.location = controller.match.old_location;
			controller.match.time = controller.match.old_time;
			controller.match.name = controller.match.old_name;
			for(i = 0; i<controller.match.plays_set.length; i++){
				play_pk = controller.match.plays_set[i].pk;
				for(j = 0; j<controller.match.plays_set[i].detailedPoints.length; j++){
					old_points = controller.match.plays_set[i].detailedPoints[j].old_detailed_points;
					new_points = controller.match.plays_set[i].detailedPoints[j].detailed_points;
					if(old_points != new_points){
						controller.match.plays_set[i].detailedPoints[j].detailed_points = old_points;
					}
				}
			}
			controller.allVisible = false;
			controller.managePlays();
		}
		controller.detectStatus();
	}

	this.deleteMatchPopup = function(ev){
		var confirm = $mdDialog.confirm()
          .title('Would you like to delete this match?')
          .targetEvent(ev)
          .ok('Yes!')
          .cancel('No');

	    $mdDialog.show(confirm).then(function() {
	    	Api.matchdelete(controller.match.pk).then(function(data){
	    			$rootScope.showToast("Match successfully removed!");
	    			$location.path("matches/");
				}, 
				function errorCallback(response) {
					return;
				});
	    }, function() {
	      $scope.status = 'You decided to keep your debt.';
	    });
	}

	this.setup = function(){
		controller.match.old_location = controller.match.location;
		controller.match.old_duration = controller.match.duration;
		controller.match.time = new Date(controller.match.time);
		controller.match.old_time = new Date(controller.match.time);
		controller.match.old_name = controller.match.name;
		if(controller.match.location == ""){
			controller.match.location = "No location";
		}
		controller.managePlays();
		controller.detectStatus();
		startTime();
	}

	this.managePlays = function(){
		for(i = 0; i< controller.match.plays_set.length;i++){
			controller.match.plays_set[i].visible = false;
			for(j = 0; j<controller.match.plays_set[i].detailedPoints.length; j++){
				controller.match.plays_set[i].detailedPoints[j].old_detailed_points = controller.match.plays_set[i].detailedPoints[j].detailed_points;
			}
			controller.match.plays_set[i].points = controller.sumPoints(controller.match.plays_set[i].detailedPoints);
		}
	}

	this.detectStatus = function(){
		var now = new Date();
		if(now < new Date(controller.match.time)){
			controller.statusColor = "md-primary";
			controller.match.statusMessage = "programmed";
		}
		else if(controller.match.status == 0){
			controller.statusColor = "md-accent";
			controller.match.statusMessage = "in progress";
		}
		else if(controller.match.status == 1){
			$timeout.cancel(controller.timer);
			controller.match.statusMessage = "completed";
		}
		else{
			console.log(controller.match.statusMessage);
		}
	}

	this.setCompletionStatus = function(id){
		if(id != controller.match.status){
			row={
				boardgame:controller.match.boardgame,
				duration:controller.match.duration,
				status:id
				}

			Api.matchput(row, controller.match.pk).then(function(data){
					controller.match.status = id;
					controller.detectStatus();
					startTime();
				}, 
				function errorCallback(response) {
					console.log(response);
				});
		}
	}

	this.is = function(message){
		return controller.match.statusMessage == message;
	}

	this.updateDuration = function(){
		$timeout.cancel(controller.timer);
	    if(controller.match.old_duration != controller.match.duration){
			row={
				boardgame:controller.match.boardgame,
				duration:controller.match.duration,
				status:controller.match.status
				}

			Api.matchput(row, controller.match.pk).then(function(data){
					
				}, 
				function errorCallback(response) {
					console.log(response);
				});
		}
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
	    controller.updateDuration();
	});
});