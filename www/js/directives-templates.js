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