//controller for the single match page
angular.module("play").controller('matchController', function(Api, $routeParams) {
	//read the requested match'id
	this.params=$routeParams;
	this.match={};
	controller=this;

	//api call to get the single match's details
	Api.match(controller.params.id).success(function(data){
		controller.match=data;
		console.log(controller.match);
		for(i = 0; i< controller.match.plays_set.length;i++){
			if (controller.match.plays_set[i].points == 999999){
				controller.match.plays_set[i].points = "N.A";
			}
		}

/*TODO*/		Api.boardgame(controller.match.boardgame).success(function(data){
			controller.match.boardgame_title=data[0].title;
		});
	});

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