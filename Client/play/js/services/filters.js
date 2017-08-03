angular.module("play")
.filter('keylength', function(){
  return function(input){
    if(!angular.isObject(input)){
      return 0;
    }
    return Object.keys(input).length;
  }
})
.filter('secondsToTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}])
.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item, key) {
      item["key"] = key;
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});