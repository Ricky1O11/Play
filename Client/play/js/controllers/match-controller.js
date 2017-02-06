//controller for the single match page
angular.module("play").controller('matchController', function(Api, $routeParams) {
	//read the requested match'id
	this.params=$routeParams;
	this.match={};
	controller=this;

	//api call to get the single match's details
	Api.match(controller.params.id).success(function(data){
		controller.match=data[0];
		console.log(controller.match);
		for(i = 0; i< controller.match.plays_set.length;i++){
			if (controller.match.plays_set[i].points == 999999){
				controller.match.plays_set[i].points = "N.A";
				controller.match.plays_set[i].visible = false;
			}
		}
		console.log(controller.match.plays_set[0].detailedPoints);
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

	//randomly color the avatars of players without a profile picture
	this.getRandomColor = function(){
		rnd = Math.floor(Math.random()*5);
		switch (rnd){
			case 0: return {'background-color':'#448AFF'}; //blue
			case 1: return {'background-color':'#FF5252'}; //red
			case 2: return {'background-color':'#7C4DFF'}; //deep purple
			case 3: return {'background-color':'#4DB6AC'}; //teal
			default: return {'background-color':'#FFD740'}; //amber
		}
	}
	this.randomColor = this.getRandomColor();

});