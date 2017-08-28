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
		"name" : "", //template name
		"has_expansions": false,
		"inserted_at": date.getTime(),
		"inserted_by": $rootScope.user.uid,
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
	}
	this.setRoundOrganization = function(val){
		templateController.postValues.roundOrganization = val;
		templateController.setHowToScore("");
		templateController.setHowToWin("");
	}
	this.setHowToScore = function(val){
		templateController.postValues.howToScore = val;
		templateController.setHowToWin("");
	}
	this.setHowToWin = function(val){
		templateController.postValues.howToWin = val;
	}
	

	/*READING FUNCTIONS*/
	this.name = "";
	 
	this.boardgames=[]; //list of boardgames to display in the dropdown menu

	this.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.

	this.dictionary=[]; //list that holds the list of templates available in the db
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
		for (i=0; i<templateController.dictionary.length; i++){
			row = {};
			row["name"] = {};
			row["bonus"] = templateController.points[i];
			row["name"][$rootScope.lang] = templateController.dictionary[i]
			templateController.postValues.scoringFields.push(row);
		}

		//prepare the "template" row to be inserted in the templates table
		if(templateController.name == "")
			templateController.name = "Template " + templateController.templates.length
		date = new Date();
		
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