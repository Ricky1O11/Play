//controller for the single match page
angular.module("play").controller('matchController', function(Api, $routeParams, $location, $mdDialog, $rootScope, $scope) {
	this.editMode = false;
	//read the requested match'id
	this.params=$routeParams;
	this.match={};
	this.allVisible=false;
	controller=this;
	//api call to get the single match's details
	Api.match(controller.params.id).then(
		function(response){
			if(response.data.length > 0){
				controller.match=response.data[0];
				controller.setup();
				var now = new Date();
				if(now < new Date(controller.match.time)){
					controller.match.status = "programmed";
				}
				else if(controller.match.status == 0){
					controller.match.status = "in progress";
				}
				else{
					controller.match.status = "completed";
				}
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
		for(i = 0; i< detailedPoints.length; i++){
			sum += detailedPoints[i].detailed_points;
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

	this.startEditMode = function(){
		controller.editMode = !controller.editMode;
		controller.allVisible = true;
	}

	this.endEditMode = function(wantToSave){
		controller.editMode = !controller.editMode;
		if(wantToSave){
			controller.match.location = controller.match.new_location;
			controller.match.duration = controller.match.new_duration ;
			controller.match.time = controller.match.new_time;
			controller.match.name = controller.match.new_name;
			row={
				duration:controller.match.duration,
				boardgame:controller.match.boardgame,
				location:controller.match.location,
				time:controller.match.time,
				name:controller.match.name
				}

			Api.matchput(row, controller.match.pk).then(function(data){
				}, 
				function errorCallback(response) {
				});

			for(i = 0; i<controller.match.plays_set.length; i++){
				play_pk = controller.match.plays_set[i].pk;
				for(j = 0; j<controller.match.plays_set[i].detailedPoints.length; j++){
					new_points = controller.match.plays_set[i].detailedPoints[j].new_detailed_points;
					old_points = controller.match.plays_set[i].detailedPoints[j].detailed_points;
					if(old_points != new_points){
						controller.match.plays_set[i].detailedPoints[j].detailed_points = new_points;
						scoringField_pk = controller.match.plays_set[i].detailedPoints[j].scoringField;
						detailedPoints = controller.match.plays_set[i].detailedPoints[j].detailed_points;
						row = {
							play:play_pk,
							scoringField:scoringField_pk,
							detailed_points:detailedPoints
						};
						Api.dpPut(row, controller.match.plays_set[i].detailedPoints[j].pk).then(function(data){
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
			controller.allVisible = false;
			controller.setup();
		}
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
		controller.match.new_location = controller.match.location;
		controller.match.new_duration = controller.match.duration;
		controller.match.new_time = controller.match.time;
		controller.match.new_name = controller.match.name;
		if(controller.match.location == ""){
			controller.match.location = "No location";
		}
		for(i = 0; i< controller.match.plays_set.length;i++){
			controller.match.plays_set[i].visible = false;
			for(j = 0; j<controller.match.plays_set[i].detailedPoints.length; j++){
				controller.match.plays_set[i].detailedPoints[j].new_detailed_points = controller.match.plays_set[i].detailedPoints[j].detailed_points;
			}
		}
	}
});