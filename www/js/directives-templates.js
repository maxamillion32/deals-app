angular.module('starter.directives-templates', [])


.directive('introSettings', function() {
  return {
    templateUrl: 'templates/directives/intro-settings.html'
  };
})

.directive('introLogin', function() {
  return {
    templateUrl: 'templates/directives/intro-login.html'
  };
})

.directive('itemCard', function() {
  return {
    templateUrl: 'templates/directives/item-card.html'
  };
})

.directive('featuredCard', function() {
  return {
    templateUrl: 'templates/directives/featured-card.html'
  };
})

.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        console.log(url)
        element.css({
            'background': 'url(' + url +')',
            'background-size' : 'cover'
        });
        
        scope.$watch("backImg", function(value) {
          element.css({
            'background': 'url(' + url +')',
            'background-size' : 'cover'
          });
        })
    };
});