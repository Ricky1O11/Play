//controller for the single match page
angular.module("play").controller('matchController', function(Api, $routeParams, $scope) {
	this.editMode = false;
	//read the requested match'id
	this.params=$routeParams;
	this.match={};
	controller=this;
	//watch the scope variable until it's loaded
	$scope.$watch('user_pk', function(newVal, oldVal){
		if(newVal != ""){
			//api call to get the single match's details
			Api.match(controller.params.id, $scope.user_pk).success(function(data){
				controller.match=data[0];
				for(i = 0; i< controller.match.plays_set.length;i++){
					if (controller.match.plays_set[i].points == 999999){
						controller.match.plays_set[i].points = "N.A";
						controller.match.plays_set[i].visible = false;
					}
				}
			});
		}
	});
	
	this.sumPoints = function(detailedPoints){
		sum = 0;
		for(i = 0; i< detailedPoints.length; i++){
			sum += detailedPoints[i].detailed_points;
		}
		return sum;
	}

	this.setVisible = function(pk){
		for(i = 0; i<controller.match.plays_set.length; i++){
			if(controller.match.plays_set[i].pk == pk){
				controller.match.plays_set[i].visible = !controller.match.plays_set[i].visible;
			}
		}
	}

	this.toggleEditMode = function(){
		controller.editMode = !controller.editMode;
	}
});