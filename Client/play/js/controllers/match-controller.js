angular.module("play").controller('matchController', function(Api, $routeParams) {
	this.params=$routeParams;
	this.match={};
	controller=this;
	Api.match(controller.params.id).success(function(data){
		controller.match=data;
		console.log(controller.match);
	});

	
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