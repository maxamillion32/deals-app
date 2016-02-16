angular.module('starter.services-categories', [])

.factory('Categories', function($q) {
  /**
  * List of pre-defined categories (example only!)
  *
  * If you expect that the categories might change frequently over time,
  * then it is recommended to store them on the server-side (Firebase)
  * and retrieve the list from here.
  *
  */
  var self = this;
  self.all = {};
  self.get = function() {
    var qCat = $q.defer();
    var ref = new Firebase(FBURL);
    //
    //console.log(filterNode, filterValue, limitValue)
    ref.child('settings').child("categories").on("value", function(snapshot) {
        self.all = snapshot.val();
        qCat.resolve(snapshot.val());
    }, function (errorObject) {
        qCat.reject(errorObject);
    });
    return qCat.promise;
  };
  
  self.set = function(CategoriesObj) {
    var qCat = $q.defer();
    var ref = new Firebase(FBURL);
    var onComplete = function(error) {
      if (error) {
          qCat.reject(error);
      } else {
          qCat.resolve();
      }
    };
    ref.child('settings').child("categories").set(CategoriesObj, onComplete);
    return qCat.promise;
  };
  
  return self;
});