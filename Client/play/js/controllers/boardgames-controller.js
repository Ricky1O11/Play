//controller for the list of boardgames
angular.module("play").controller('boardgamesController', function(Api, $scope,Utils, $location, $routeParams, Utils) {
	this.range = Utils.range;
	this.location=$location.path();
	this.toggleFavourite = Utils.toggleFavourite
	//this.boardgames=[]; //container of the list of boardgames
	this.selectedOrderingField="average"; //ordering field, selectable by the user
	this.actualOrderingField="average"; //ordering field, selectable by the user
	this.displayedSearchKey=""; //ordering field, selectable by the user
	this.searchKey=""; //ordering field, selectable by the user
	this.endAt=10; //ordering field, selectable by the user
	this.endAtKey=""; //ordering field, selectable by the user
	this.designer = -1;
	if(this.location.indexOf("designers") >= 0){
		this.designer = $routeParams.id;
	}
	controller=this; 


	var DynamicItems = function() {
	  /**
	   * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
	   */
	  this.loadedPages = {};

	  /** @type {number} Total number of items. */
	  this.numItems = 0;

	  /** @const {number} Number of items to fetch per request. */
	  this.PAGE_SIZE = 20;

	  this.loaded = 0;
	};

	// Required.
	DynamicItems.prototype.getItemAtIndex = function(index) {
	  var pageNumber = Math.floor(index / this.PAGE_SIZE);
	  var page = this.loadedPages[pageNumber];

	  if (page) {
		return page[index % this.PAGE_SIZE];
	  } else if (page !== null) {
		this.fetchPage_(pageNumber);
	  }
	};

	// Required.
	DynamicItems.prototype.getLength = function() {
		if(Object.keys(this.loadedPages).length > 0){
			l = this.loadedPages[0].length;
			if(l < 20)
				return l;
		}
		return this.loaded+1;
	};

	DynamicItems.prototype.fetchPage_ = function(pageNumber) {
		// Set the page to null so we know it is already being fetched.
		this.loadedPages[pageNumber] = null;
		this.loadedPages[pageNumber] = {};
		this.loaded += this.PAGE_SIZE;
		lp = this.loadedPages; 
		ps = this.PAGE_SIZE;
		//api call to the list of boardgames
		if (controller.searchKey != ""){
			controller.endAt = controller.searchKey.substring(0, controller.searchKey.length-1) + 
								Utils.changeLetter(controller.searchKey.substring(controller.searchKey.length-1, controller.searchKey.length-0))
		}
		Api.boadgames(controller.searchKey, 20, controller.actualOrderingField, controller.endAt, controller.endAtKey).$loaded()
		.then(function(response){
			if(controller.actualOrderingField != "search_name"){
				if(controller.searchKey != ""){
					response.sort(function(a,b) {return (a.average < b.average) ? 1 : ((b.average < a.average) ? -1 : 0);} );
				}
				else{
					response.reverse()
				}
			}
			lp[pageNumber]=response;
			
			console.log(lp[pageNumber])
			controller.searchKey = lp[pageNumber][19].search_name;
			controller.endAt = lp[pageNumber][19].average;
			controller.endAtKey = ""+lp[pageNumber][19].bggId;
	
		}).catch(function(error) {
		    console.error("Error:", error);
		});

	};

	this.boardgames = new DynamicItems();
	
	//set the ordering field selected by the user
	this.setOrderingField = function(field) {
		controller.selectedOrderingField = field;
		controller.displayedSearchKey=""; //ordering field, selectable by the user
		controller.searchKey=""; //ordering field, selectable by the user
		controller.endAt=10;
		controller.endAtKey="";
		controller.actualOrderingField = field;
		controller.boardgames = new DynamicItems();
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.selectedOrderingField;
	}

	this.search = function(){
		controller.searchKey = controller.displayedSearchKey.toLowerCase();	
		controller.boardgames = new DynamicItems();
	}
});