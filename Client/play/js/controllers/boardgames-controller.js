//controller for the list of boardgames
angular.module("play").controller('boardgamesController', function(Api, $scope,$location, $routeParams) {
	this.location=$location.path();
	//this.boardgames=[]; //container of the list of boardgames
	this.selectedOrderingField="-average"; //ordering field, selectable by the user
	this.actualOrderingField="-average"; //ordering field, selectable by the user
	this.searchKey=""; //ordering field, selectable by the user
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
			var pageOffset = pageNumber * this.PAGE_SIZE;
			//api call to the list of boardgames
			if(controller.actualOrderingField == "favourite"){
				Api.favourites(controller.searchKey).then(function(response){
					lp[pageNumber]=response.data;
					for(i=0;i<lp[pageNumber].length;i++){
						if(lp[pageNumber][i].favourite > 0){
							lp[pageNumber][i].isFavourite = true;
						}
						else{
							lp[pageNumber][i].isFavourite = false;
						}
						lp[pageNumber][i].listId = i;
					}

				}, function errorCallback(response){
					console.log(response);
				});
			}
			else{
				Api.boadgames(pageOffset, ps, controller.actualOrderingField, controller.searchKey, controller.designer).then(function(response){
					lp[pageNumber]=response.data;
					for(i=0;i<lp[pageNumber].length;i++){
						if(lp[pageNumber][i].favourite > 0){
							lp[pageNumber][i].isFavourite = true;
						}
						else{
							lp[pageNumber][i].isFavourite = false;
						}
						lp[pageNumber][i].listId = i;
					}

				}, function errorCallback(response){
					console.log(response);
				});
			}

		};

	this.boardgames = new DynamicItems();

	this.toggleFavourites = function(favourite, boardgame, user, id, index){
		page_number = Math.floor(index / controller.boardgames["PAGE_SIZE"]);
		if(favourite > 0){
		  Api.favouritedelete(favourite).then(
							  function(response){
							  }, function errorCallback(response){
							  }
							);
			controller.boardgames.loadedPages[page_number][id].favourite = -1;
			controller.boardgames.loadedPages[page_number][id].isFavourite = false;
		}
		else{
			data = {'boardgame': boardgame};
			Api.favouritepost(data).then(
							  function(response){
								controller.boardgames.loadedPages[page_number][id].favourite = response.data.pk;
							  }, function errorCallback(response){
							  }
			);
			controller.boardgames.loadedPages[page_number][id].isFavourite = true;
		}
	}

	//create ordered list of numbers
	this.range = function(a, b, step) {
		step = step || 1;
		var input = [];
		if(a>b){
		  for (var i = a; i >= b; i -= step) {
			input.push(i);
		  }
		}
		else{
		  for (var i = a; i <= b; i += step) {
			input.push(i);
		  }
		}
		return input;
	};
	
	//set the ordering field selected by the user
	this.setOrderingField = function(field) {
		controller.selectedOrderingField = field;
		if(field == "sfavourite"){
			Api.favourites().then(function(response){
				lp[pageNumber]=response.data;
				for(i=0;i<lp[pageNumber].length;i++){
					if(lp[pageNumber][i].favourite > 0){
						lp[pageNumber][i].isFavourite = true;
					}
					else{
						lp[pageNumber][i].isFavourite = false;
					}
					lp[pageNumber][i].listId = i;
				}

			}, function errorCallback(response){
				console.log(response);
			});
		}
		//else
		controller.actualOrderingField = field;
		this.boardgames = new DynamicItems();
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.selectedOrderingField;
	}

	this.search = function(){
		this.boardgames = new DynamicItems();
	}
});