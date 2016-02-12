angular.module('starter.services-utils', [])

/**
 * All other complementary functions
 */
.factory('Utils', function($ionicLoading, $timeout) {
  var self = this;

  //
  // ionic loading notification
  self.showMessage = function(message, optHideTime) {
    if(optHideTime != undefined && optHideTime > 100) {
      // error message or notification (no spinner)
      $ionicLoading.show({
          template: message
      });
      $timeout(function(){
          $ionicLoading.hide();
      }, optHideTime)
    } else {
      // loading (spinner)
      $ionicLoading.show({
          template: message + '<br><br>' + '<ion-spinner class="spinner-modal"></ion-spinner>'
      });
      
      $timeout(function(){    // close if it takes longer than 10 seconds
          $ionicLoading.hide();
          //self.showMessage("Timed out", 2000);
      }, 20000)
      
    }
  };

  self.arrayValuesAndKeys = function(targetObject) {
    return Object.keys(targetObject).map(
      function (key) {
        return {
          key: key,
          value: targetObject[key]
        }
      }
    );
  };
  
  self.arrayValuesAndKeysProducts = function(targetObject) {
        return Object.keys(targetObject).map(
            function (key) {
                if(targetObject[key] != null) {
                    return {
                        key: key, 
                        value: targetObject[key].meta,
                        index: targetObject[key].index
                    }
                }
            }
        );
    };

  self.arrayValues = function(targetObject) {
    return Object.keys(targetObject).map(
      function (key) {
        return targetObject[key]
      }
    );
  };

  self.arrayKeys = function(targetObject) {
    return Object.keys(targetObject).map(
      function (key) {
        return key;
      }
    );
  };

  self.sortArray = function(targetObject, sortOptions) {
    console.log(targetObject)
    var sortProperty = sortOptions.property.toLowerCase();
    if(sortProperty == 'date') {
      sortProperty = "timestamp_creation";
    }
    switch(sortOptions.method){
      case 'asc':
        //
        return targetObject.sort(compareDesc);
      break
      case 'desc':
        //
        return targetObject.sort(compareAsc);
      break
    }
    function compareDesc(a,b) {
        a = a['value'];
        b = b['value'];
        console.log(a, b)
        if (a[sortProperty] < b[sortProperty])
            return -1;
        else if (a[sortProperty] > b[sortProperty])
            return 1;
        else
            return 0;
    };
    function compareAsc(a,b) {
        a = a['value'];
        b = b['value'];
        if (a[sortProperty] > b[sortProperty])
            return -1;
        else if (a[sortProperty] < b[sortProperty])
            return 1;
        else
            return 0;
    };
  };
  
  // used to determine the number of slides
  self.prepareSlideRepeat = function(ProductMeta) {
    var nbSlides = Math.ceil(ProductMeta.length/2);
    var indexArray = [];
    for(var i=0; i<nbSlides; i++) {
      indexArray[i] = i;
    };
    return indexArray;
  };

  self.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  self.formatTimestamp = function(timestamp) {
    var date = new Date(timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  };
  
  self.isInArray = function(value, array) {
    return array.indexOf(value) > -1;
  };
  
  self.findIndexInArray = function(value, array) {
    console.log(array.length)
    var iter = null;
    for (var i=0; i<array.length; i++) {
      console.log(array[i], value)
      if(array[i] === value) {
        iter = i;
        return i;
      }
    }
    return iter;
  };
  
  
  self.timeSince = function(unix_timestamp) {
    
    var date = new Date(unix_timestamp);
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  };
  
  self.genRandomName = function() {
    return 'smart-user' + Math.floor(Math.random()*10000000000);
  };
  

  return self;
})
