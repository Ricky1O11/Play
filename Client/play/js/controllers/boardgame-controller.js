//controller for the single boardgame page
angular.module("play").controller('boardgameController', function(Api, Utils, $firebaseObject, $routeParams, $scope, $rootScope, $mdDialog,currentAuth) {
	//read the requested boardgame'id
	this.params=$routeParams;
	this.boardgame={};
	this.isFavourite = false; 

	this.toggleFavourite = Utils.toggleFavourite
	this.range = Utils.range;
	
	controller=this;
	controller.match_played = 0; 
	controller.match_finished = 0; 
	controller.match_won = 0; 
	controller.chart = {};
    controller.chart.games = {};
    controller.chart.games["labels"] = [];
    controller.chart.games["values"] = [];
    controller.chart.winned_games = {};
    controller.chart.winned_games["labels"] = ["won", "lost"];
    controller.chart.winned_games["values"] = [];
    controller.chart.companions = {}
	controller.chart.companions["labels"] = []
	controller.chart.companions["values"] = {}
	controller.chart.companions["values"]["won"] = []
	controller.chart.companions["values"]["played"] = []
	controller.chart.match_status = {};
    controller.chart.match_status["labels"] = ["completed", "pending"];
    controller.chart.match_status["values"] = [];

    controller.companions = {};
	//api call to get the single boardgame's details
	controller.boardgame = Api.boardgame(controller.params.id);
	Api.matches(currentAuth.uid, controller.params.id).$loaded().then(
		function(matches){
			controller.matches = matches;
			angular.forEach(controller.matches, function(value, m) {
				console.log(m)
				match = controller.matches[m];
				//get finished, won and played matches
				if(match.completed){
					controller.match_finished++;
					if(match.winner != "" && $rootScope.user.uid in match.winner)
						controller.match_won++;
				}
				controller.match_played++;

				for(p in match.players){
					player = match.players[p];
					if(p != $rootScope.user.uid){
						if(p in controller.companions){
							controller.companions[p]["amount"] += 1
							if(match.winner == $rootScope.user.uid)
								if("won" in controller.companions[p])
									controller.companions[p]["won"] += 1
								else
									controller.companions[p]["won"] = 1
						}
						else{
							controller.companions[p] = {}
							controller.companions[p]["amount"] = 1
							if(match.winner == $rootScope.user.uid)
								controller.companions[p]["won"] = 1
							else{
								controller.companions[p]["won"] = 0
							}
							controller.companions[p]["username"] = player.username;
							controller.companions[p]["image"] = player.image;
					 	}
					}
				}

				
			});
			controller.chart.match_status["values"] = [controller.match_finished,controller.match_played-controller.match_finished];
			controller.chart.winned_games["values"] = [controller.match_won,controller.match_finished-controller.match_won];
            for(c in controller.companions){
            	controller.chart.companions["labels"].push(controller.companions[c].username);
            	controller.chart.companions["values"]["played"].push(controller.companions[c].amount);
            	controller.chart.companions["values"]["won"].push(controller.companions[c].won);
            }
		});

	




});