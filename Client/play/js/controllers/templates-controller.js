//controller for the popup dialog used to insert a new match
angular.module("play").controller('templatesController', function($scope, Utils, Api, $rootScope, $mdDialog, $location) {
	// list of `state` value/display objects
	templateController=this;
	
	this.templates=[];

	let date = new Date();

	this.postValues={
		"gameType" : "", //cooperative/competitive
		"playersOrganization" : "", //team based/all vs all
		"roundOrganization" : "", //single/multi rorund
		"howToScore" : "", //points based/ WIN/LOSE based
		"howToWin" : "", //most points win/less points win/most rounds win
		"scoring_fields" : [],
		"teams" : [],
		"name" : "", //template name
		"has_expansions": false,
		"inserted_at": date.getTime(),
		"inserted_by": $rootScope.user.uid,
		"nteams" : 0,
	};

	this.setGameType = function(val){
		templateController.postValues.gameType = val;	
		templateController.setPlayersOrganization("");
		templateController.setRoundOrganization("");
		templateController.setHowToScore("");
		templateController.setHowToWin("");
		if(val == "cooperative"){
			templateController.setPlayersOrganization("team based");
		}
	}
	this.setPlayersOrganization = function(val){
		templateController.postValues.playersOrganization = val;
		templateController.setRoundOrganization("");
		templateController.setHowToScore("");
		templateController.setHowToWin("");
		if(val == "team based"){
			templateController.postValues.nteams = 2;
		}
		else{
			templateController.postValues.nteams = 0;
		}
	}
	this.setRoundOrganization = function(val){
		templateController.postValues.roundOrganization = val;
		templateController.setHowToScore("");
		templateController.setHowToWin("");
	}
	this.setHowToScore = function(val){
		templateController.postValues.howToScore = val;
		templateController.setHowToWin("");
		if(val == "win/lose"){
			if(templateController.postValues.roundOrganization == "round based")
				templateController.setHowToWin("most rounds");
			else
				templateController.setHowToWin("-");
		}
	}
	this.setHowToWin = function(val){
		templateController.postValues.howToWin = val;
	}
	

	/*READING FUNCTIONS*/
	this.name = "";
	 
	this.boardgames=[]; //list of boardgames to display in the dropdown menu

	this.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.

	this.dictionary=[]; //list that holds the list of templates available in the db
	this.nteams=2; //list that holds the list of templates available in the db
	this.teams=[]; //list that holds the list of templates available in the db
	this.points=[0,0,0,,0,0,0,0,0,0,0,0,0,0,0]; //holds the values for the corresponding scoring field

	this.range = Utils.range;

	//Search for boardagames
	this.querySearchBoardgames = function (query) {
		query = query.toLowerCase();
		if (query != ""){
			templateController.endAt = query.substring(0, query.length-1) + 
								Utils.changeLetter(query.substring(query.length-1, query.length-0))
		}
		return Api.boadgames(query, 20, "search_name", templateController.endAt, "").$loaded().then(function(response){
			templateController.boardgames = [];
			for (i=0; i<response.length; i++){
				if(response[i].search_name.indexOf(query.toLowerCase()) !== -1){
					templateController.boardgames[i] = response[i];
				}
			}
			return templateController.boardgames;
		});
	}

	this.getCurrentTemplates = function(boardgame){
		if(boardgame){
			Api.templates(boardgame.bggId).$loaded().then(
				function(response){
					console.log(response);
					if(response.length > 0){
						templateController.templates = response;
						for(i=0;i<templateController.templates.length;i++)
							templateController.templates[i].visible = false;
					}
					else{
						templateController.templates = [];
					}
				},
				function errorCallback(response) {
				}
			);
		}
		else{
			templateController.templates = [];
		}
	}


	/*WRITING FUNCTIONS*/
	this.postTemplate = function(){
		lang = $rootScope["lang"];
		templateController.postValues.scoring_fields = [];
		templateController.postValues.teams = [];
		for (i=0; i<templateController.dictionary.length; i++){
			row = {};
			row["name"] = {};
			row["bonus"] = templateController.points[i];
			row["name"][$rootScope.lang] = templateController.dictionary[i]
			templateController.postValues.scoring_fields.push(row);
		}

		for (i=0; i<templateController.postValues.nteams; i++){
			row = {};
			row["name"] = {};
			row["image"] = "";
			row["name"][$rootScope.lang] = templateController.teams[i]
			templateController.postValues.teams.push(row);
		}

		if(templateController.postValues.gameType == "cooperative" && templateController.postValues.playersOrganization == "team based"){
			row = {};
			row["name"] = {};
			row["image"] = "";
			row["name"][$rootScope.lang] = "The game"
			templateController.postValues.teams.push(row);
		}

		//prepare the "template" row to be inserted in the templates table
		if(templateController.postValues.name == "")
			templateController.postValues.name = "Template " + templateController.templates.length
		
		//post template
		Api.templatespost(templateController.boardgame, $rootScope.user.uid, templateController.postValues).$loaded().then(
			function(response){
				templateController.currentTab++;
			},
			function errorCallback(response){
			}
		);
		
	}

	this.countInsertedWords = function(){
		nonNullWords = templateController.dictionary.filter(function(value) { return value !== "" }).length;
		return nonNullWords;
	}

	this.setVisible = function(pk){
		templateController.templates[pk].visible = !templateController.templates[pk].visible;
	}

});