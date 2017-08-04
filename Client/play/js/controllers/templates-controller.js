//controller for the popup dialog used to insert a new match
angular.module("play").controller('templatesController', function($scope, Api, $rootScope, $mdDialog, $location) {
	// list of `state` value/display objects
	templateController=this;
	
	templateController.selectedValues={}; //dictionary that holds the values inserted by the user (time, location, game title, etc)
	templateController.selectedValues.templates=[];

	templateController.postValues={}; //dictionary that holds the values inserted by the user, in a format suitable to be posted to the server
	templateController.postValues.templates=[];
	templateController.postValues.scoringFields=[];
	
	templateController.name = "";
	 
	templateController.boardgames=[]; //list of boardgames to display in the dropdown menu

	templateController.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.

	templateController.dictionary=[]; //list that holds the list of templates available in the db
	templateController.points=[0,0,0,,0,0,0,0,0,0,0,0,0,0,0]; //holds the values for the corresponding scoring field

	templateController.adding = false;
	templateController.selecting = false;
	templateController.saving = false;

	templateController.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};

	//Search for boardagames
	templateController.querySearchBoardgames = function (query) {
		return Api.boadgames(query, 20, "name").$loaded().then(function(response){
			templateController.boardgames = [];
			for (i=0; i<response.length; i++){
				if(response[i].name.indexOf(query) !== -1)
					templateController.boardgames[i] = response[i];
			}
			//	if(response[i].expands.length == 0)
			//		console.log(response[i])
			//		templateController.boardgames.push({display:response[i].title, value:response[i].title.toLowerCase(), id:response[i].pk, thumbnail:response[i].thumbnail, img:response[i].img, expansions:response[i].expansions})
			//}
			return templateController.boardgames;
		});
	}

	/**
	 * Create filter function for a query string
	 */
	function createFilterFor(query) {
	  var lowercaseQuery = angular.lowercase(query);
	  return function filterFn(state) {
		return (state.value.indexOf(lowercaseQuery) === 0);
	  };
	}

	this.getCurrentTemplates = function(boardgame){
		if(boardgame){
			Api.templates(boardgame.bggId).$loaded().then(
				function(response){
					console.log(response);
					if(response.length > 0){
						templateController.selectedValues.templates = response;
						for(i=0;i<templateController.selectedValues.templates.length;i++)
							templateController.selectedValues.templates[i].visible = false;
					}
					else{
						templateController.selectedValues.templates = [];
					}
				},
				function errorCallback(response) {
				}
			);
		}
		else{
			templateController.selectedValues.templates = [];
		}
	}

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
			templateController.name = "Template " + templateController.selectedValues.templates.length
		templateController.postValues.template={	
				"name": templateController.name,
				//hasExpansions: (templateController.selectedValues.expansions.length > 0)
				"has_expansions": false,
				"scoring_fields": templateController.postValues.scoringFields
			};
		
		//post template
		Api.templatespost(templateController.selectedValues.boardgame.bggId, templateController.postValues.template).$loaded().then(
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
		templateController.selectedValues.templates[pk].visible = !templateController.selectedValues.templates[pk].visible;
	}

});