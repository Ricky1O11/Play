//controller for the popup dialog used to insert a new match
angular.module("play").controller('templatesController', function($scope, Api, $rootScope, $mdDialog, $location) {
	// list of `state` value/display objects
	self=this;
	
	self.selectedValues={}; //dictionary that holds the values inserted by the user (time, location, game title, etc)
	self.selectedValues.dictionary=[]; //list that holds the list of templates available in the db

	self.postValues={}; //dictionary that holds the values inserted by the user, in a format suitable to be posted to the server
	self.postValues.templates=[];
	self.postValues.scoringFields=[];
	self.postValues.dictionary = [];
	self.postValues.dp=[];
	
	
	self.boardgames=[]; //list of boardgames to display in the dropdown menu

	self.dictionary=[];  //list of users to display in the dropdown menu
	self.nwords=1; //holds the selected amount of players

	self.boardgameSearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.
	self.dictionarySearchText=[]; //holds the currently searched string used to filter the lists of the dropdown menus.
	self.points=[]; //holds the values for the corresponding scoring field

	self.adding = false;
	self.selecting = false;
	self.saving = false;

	self.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};
	

	Api.dictionary().success(function(data){
		for (i=0; i<data.length; i++){
			self.dictionary[i]={display:data[i].word, value:data[i].word.toLowerCase(), id:data[i].pk}
		}
	});

	//Search for boardagames
	self.querySearchBoardgames = function (query) {
		return Api.boadgames(0, 100, "title", query).then(function(response){
			self.boardgames = [];
			for (i=0; i<response.data.length; i++){
				if(response.data[i].expands.length == 0)
					self.boardgames.push({display:response.data[i].title, value:response.data[i].title.toLowerCase(), id:response.data[i].pk, thumbnail:response.data[i].thumbnail, img:response.data[i].img, expansions:response.data[i].expansions})
			}
			return self.boardgames;
		});
	}

	//Search for users
	self.querySearchWord = function (query) {
		if(query){
			results = self.dictionary.filter(createFilterFor(query));
		}
		else{
			results= self.dictionary;
		}
		return results;
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
		Api.templates(boardgame.id).then(
			function(response){
				self.selectedValues.templates = response.data;
				if(self.selectedValues.templates.length == 0){
					self.postBasicTemplate();
				}
				
				for(i=0;i<self.selectedValues.templates.length;i++)
					self.selectedValues.templates[i].visible = false;
			},
			function errorCallback(response) {
				console.log(response);
			}
		);
	}


	this.addTemplate = function(wantToAdd){
		if(!self.adding){
			self.adding = true;
			if(wantToAdd){
			}
			else{
				self.selectedValues.dictionary[0] = self.dictionary[0];
				self.postMatch("postTemplate");
			}
		}
	}

	this.selectTemplate = function(template){
		if(!self.selecting){
			self.selecting = true;
			self.selectedValues.scoringFields = template.scoringField_details;
			self.postMatch("selectTemplate");
		}
	}

	this.createTemplate = function(){
		if(!self.saving){
			self.saving = true;
			self.postMatch("createTemplate");
		}
	}

	this.postBasicTemplate = function(){
		//prepare the "template" row to be inserted in the templates table
		row={	
				boardgame:self.selectedValues.boardgame.id,
				hasExpansions: false
			};
		self.postValues.templates.push(row);
		
		//post template
		Api.templatespost(self.postValues.templates).then(
			function(response){
				self.selectedValues.templates = [response.data[0]];
				self.postBasicScoringFields();
			},
			function errorCallback(response){
				console.log(response)
			}
		);
	}

	this.postTemplate = function(){
		//prepare the "template" row to be inserted in the templates table
		row={	
				boardgame:self.selectedValues.boardgame.id,
				hasExpansions: (self.selectedValues.expansions.length > 0)
			};
		self.postValues.templates.push(row);
		
		//post template
		Api.templatespost(self.postValues.templates).then(
			function(response){
				self.selectedValues.templates = response.data[0];
				self.postScoringFields();
			},
			function errorCallback(response){
			}
		);
		
	}

	this.postBasicScoringFields = function(){
		//prepare the "template" row to be inserted in the templates table
		row={	
				template:self.selectedValues.templates[0].pk,
				word: 1,
				bonus: 1
			};
		self.postValues.scoringFields.push(row);

		//post scoring field
		Api.scoringfieldspost(self.postValues.scoringFields).then(
			function(response){
				self.selectedValues.templates[0].scoringField_details = response.data;
				console.log(self.selectedValues.templates)
			},
			function errorCallback(response){
			}
		);
	}

	this.postScoringFields = function(){
		//clean selectedValues array removing all null entries
		self.selectedValues.dictionary = self.selectedValues.dictionary.filter(function(n){return n != null});
		for (i=0; i<self.selectedValues.dictionary.length; i++){
			//prepare the "template" row to be inserted in the templates table
			row={	
					template:self.selectedValues.templates.pk,
					word: self.selectedValues.dictionary[i].id,
					bonus: self.points[i]
				};
			self.postValues.scoringFields.push(row);
		}
		//post template
		Api.scoringfieldspost(self.postValues.scoringFields).then(
			function(response){
				self.selectedValues.scoringFields = response.data;
				self.postDetailedPoints();
			},
			function errorCallback(response){
			}
		);
	}

	this.postWord = function(){
		for (i=0; i<self.dictionarySearchText.length; i++){
			if( self.selectedValues.dictionary[i] == null){
				row={
					word:self.dictionarySearchText[i],
					description:""
				};
				self.postValues.dictionary.push(row);
			}
		}
		if(self.postValues.dictionary.length>0){
			Api.dictionarypost(self.postValues.dictionary).then(
				function(response){
					for (j=0; j<response.data.length; j++){
						row = {display: response.data[j].word, value: response.data[j].word, id: response.data[j].pk}
						self.selectedValues.dictionary.push(row);
					}
					self.postTemplate();
				},
				function errorCallback(response){
				}
			);
		}
		else{
			self.postTemplate();
		}
	}


	this.setVisible = function(pk){
		for(i=0;i<self.selectedValues.templates.length;i++){
			if(self.selectedValues.templates[i].pk == pk)
				self.selectedValues.templates[i].visible = !self.selectedValues.templates[i].visible;
		}
	}

	this.containsObject = function(obj, list) {
		var i;
		for (i = 0; i < list.length; i++) {
			if (list[i] === obj) {
				return true;
			}
		}
		return false;
	}

	this.togglePlayer = function(act, user, id){
		if(act == "select"){
			self.selectedValues.players.push(user);
			for(i=0;i<self.users.length;i++){
				if(self.users[i].id == id)
					self.users.splice(i, 1);
			}
		}
		else{
			self.selectedValues.players.splice(id, 1);
			self.users.push(user);
		}
	}

	this.back = function(){
		self.currentTab--;
	}

	this.dismiss = function(){
		$mdDialog.hide();
	}

	this.updateVote = function(template, val){
		if(template.user_vote != 0){
			Api.templatevotes(template.pk, self.user_pk).then(function(response){
					Api.templatevotesdelete(response.data[0].pk).then(function(response){
						}, function errorCallback(response){
							console.log(response);
					});
				}, function errorCallback(response){
					console.log(response);
			});
		}

		row = [{vote : val, template: template.pk, user: self.user_pk}];
		Api.templatevotespost(row).then(function(response){
				template.votes = parseInt(template.votes)-parseInt(template.user_vote)+parseInt(response.data[0].vote);
				template.user_vote = response.data[0].vote;
			}, function errorCallback(response){
				console.log(response.data);
		});
	}
});