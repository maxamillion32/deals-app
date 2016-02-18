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
    templateUrl: 'templates/directives/cards/item-card.html'
  };
})

.directive('featuredCard', function() {
  return {
    templateUrl: 'templates/directives/cards/featured-card.html'
  };
})

.directive('submitDealLocal', function() {
  return {
    templateUrl: 'templates/directives/submit-deal-local.html'
  };
})
.directive('submitDealOnline', function() {
  return {
    templateUrl: 'templates/directives/submit-deal-online.html'
  };
})
.directive('submitDealVoucher', function() {
  return {
    templateUrl: 'templates/directives/submit-deal-voucher.html'
  };
})

.directive('customMenuItems', function() {
  return {
    templateUrl: 'templates/directives/custom-menu-items.html'
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