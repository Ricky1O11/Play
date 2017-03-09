//controller for the list of boardgames
angular.module("play").controller('boardgamesController', function(Api, $scope) {
	//this.boardgames=[]; //container of the list of boardgames
	this.orderingField="-average"; //ordering field, selectable by the user
	controller=this;


	var DynamicItems = function() {
		  /**
		   * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
		   */
		  this.loadedPages = {};

		  /** @type {number} Total number of items. */
		  this.numItems = 0;

		  /** @const {number} Number of items to fetch per request. */
		  this.PAGE_SIZE = 50;

		  this.fetchNumItems_();
		};

		// Required.
		DynamicItems.prototype.getItemAtIndex = function(index) {
		  var pageNumber = Math.floor(index / this.PAGE_SIZE);
		  var page = this.loadedPages[pageNumber];

		  if (page) {
			return page[index % this.PAGE_SIZE];
		  } else if (page !== null) {
		  	console.log("dsf");
			this.fetchPage_(pageNumber);
		  }
		};

		// Required.
		DynamicItems.prototype.getLength = function() {
			return this.numItems;
		};

		DynamicItems.prototype.fetchPage_ = function(pageNumber) {
			// Set the page to null so we know it is already being fetched.
			this.loadedPages[pageNumber] = null;
			this.loadedPages[pageNumber] = {};
			lp = this.loadedPages;
			ps = this.PAGE_SIZE;
			var pageOffset = pageNumber * this.PAGE_SIZE;
			//api call to the list of boardgames
			Api.boadgames(pageOffset, ps).then(function(response){
				lp[pageNumber]=response.data;
				for(i=0;i<lp[pageNumber].length;i++){
					if(lp[pageNumber][i].favourite.length > 0){
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

		};

		DynamicItems.prototype.fetchNumItems_ = function() {
			this.numItems = 500000;
		};

	this.boardgames = new DynamicItems();
	console.log(this.boardgames );

	//api call to the list of boardgames
	//Api.boadgames().then(function(response){
	//	controller.boardgames=response.data;
	//	for(i=0;i<controller.boardgames.length;i++){
	//		if(controller.boardgames[i].favourite.length > 0){
	//			controller.boardgames[i].isFavourite = true;
	//		}
	//		else{
	//			controller.boardgames[i].isFavourite = false;
	//		}
	//		controller.boardgames[i].listId = i;
	//	}
	//}, function errorCallback(response){
	//});
	
	this.toggleFavourites = function(favourite, boardgame, user, id){
		if(favourite.length > 0){
		  Api.favouritedelete(favourite[0].pk).then(
							  function(response){
							  }, function errorCallback(response){
							  }
							);
			controller.boardgames[id].favourite = [];
			controller.boardgames[id].isFavourite = false;
		}
		else{
			data = {'boardgame': boardgame};
			Api.favouritepost(data).then(
							  function(response){
								controller.boardgames[id].favourite = [{'pk' : response.data.pk}];
							  }, function errorCallback(response){
							  }
			);
			controller.boardgames[id].isFavourite = true;
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
		controller.orderingField = field;
	}
	
	//get the ordering field selected by the user
	this.getOrderingField= function(){
		return controller.orderingField;
	}
});