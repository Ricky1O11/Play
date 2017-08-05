//controller for the single designer page
angular.module("play").controller('categoryController', function(Api, $routeParams, $scope) {
	//read the requested boardgame'id
	//this.toggleFavourite = Utils.toggleFavourite;
	this.params=$routeParams;
	this.designer = [];
	this.startAt = "";
	controller=this;

	var DynamicItems = function() {
		  this.loadedPages = {};

		  this.numItems = 0;

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
			Api.category(controller.params.id, controller.startAt).$loaded().then(function(response){
				lp[pageNumber]=response;
				controller.startAt = lp[pageNumber][19].name
			}).catch(function(error) {
			    console.error("Error:", error);
			});

		};

	this.category = new DynamicItems();
	console.log(this.category)
});