angular.module("play")
.factory('Utils', function($rootScope){
  return {
            toggleFavourite: function(boardgame) {
              console.log(boardgame)
              date = new Date();
                    if("favourites" in $rootScope.user["profile_details"]){
                      if(boardgame.bggId in $rootScope.user["profile_details"]["favourites"]){
                        delete $rootScope.user["profile_details"]["favourites"][boardgame.bggId];
                      }
                      else{
                        $rootScope.user["profile_details"]["favourites"][boardgame.bggId] = {
                          "name": boardgame.name,
                          "image": boardgame.image,
                          "bggId": boardgame.bggId,
                          "inserted_at": date.getTime()
                        }
                      }
                    }
                    else{
                      $rootScope.user["profile_details"]["favourites"] = {};
                      $rootScope.user["profile_details"]["favourites"][boardgame.bggId] = {
                          "name": boardgame.name,
                          "image": boardgame.image,
                          "bggId": boardgame.bggId,
                          "inserted_at": date.getTime()
                        }
                    }
            },
          
            timestampToDate: function(timestamp){
                return date = new Date(timestamp*1000);
                // Hours part from the timestamp
                var hours = date.getHours();
                // Minutes part from the timestamp
                var minutes = "0" + date.getMinutes();
                // Seconds part from the timestamp
                var seconds = "0" + date.getSeconds();

                // Will display time in 10:30:23 format
                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            },

            getMax: function(array, field){
              max = 0;
              id = "";

              for(i in array){
                if(array[i][field] > max){
                  max = array[i][field];
                  id = ""+i;
                }
              }
              return id;

            }
          }
});