angular.module('starter.services-personal', [])

/**
* Retrieves the list of possible personal options
* Used for autocomplete
*/
.factory('Personal', function($q) {
  var self = this;

  var self = this;
  self.get = function(personalField) {
    var qCat = $q.defer();
    var ref = new Firebase(FBURL);
    //
    //console.log(filterNode, filterValue, limitValue)
    ref.child('settings').child("personal").child(personalField).on("value", function(snapshot) {
        qCat.resolve(snapshot.val());
    }, function (errorObject) {
        qCat.reject(errorObject);
    });
    return qCat.promise;
  };
  
  return self;
});
