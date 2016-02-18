/**
 * Firebase Auth Pack
 * 
 * @version: v1.1
 * @date: 2016-02-09
 * @author: Noodlio <noodlio@seipel-ibisevic.com>
 * @website: www.noodl.io
 * 
 * versions: {
 *  ionic:        1.2.4
 *  firebase:     2.4.0
 *  angularfire:  1.1.3
 * }
 * 
 * To edit the SASS, please install gulp first:
 * npm install -g gulp
 * 
 * Also make sure that you have installed the following ngCordova dependencies:
 *  cordova plugin add cordova-plugin-inappbrowser
 * 
 */
 
var FBURL                 = "https://templates-noodlio.firebaseio.com/deals-app";
var LIMITVALUE            = 50;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic', 
  'ngCordova',
  'firebase',
  
  // intro
  'starter.controllers-redirect',
  
  // auth and profile
  'starter.controllers-account',
  'starter.services-auth',
  'starter.services-profile',
  'starter.services-personal',
  
  // browsing
  'starter.controllers-live',
  'starter.controllers-wallet',
  'starter.controllers-search',
  'starter.controllers-submissions',
  'starter.services-products',
  
  // product
  'starter.controllers-product',
  'starter.services-comments', // &upvotes
  
  // submit management
  'starter.controllers-submit',
  'starter.services-categories',
  
  // cordova
  'starter.services-cordova-camera',
  
  // helpers
  'starter.services-codes',
  'starter.services-utils',
  'starter.services-fb-functions',
  'starter.directives-templates'
  ]
)

.run(function($ionicPlatform, $rootScope, $ionicHistory, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  
  // Redirect the user to the login state if unAuthenticated
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    console.log("$stateChangeError", error);
    event.preventDefault(); // http://goo.gl/se4vxu
    if(error == "AUTH_LOGGED_OUT") {
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $state.go('redirect');
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  $ionicConfigProvider.tabs.position('top')
  
  // Define the resolve function, which checks whether the user is Authenticated
  // It fires $stateChangeError if not the case
  var authResolve = function (Auth) {
    return Auth.getAuthState();
  };
  
  $stateProvider
  
  // redirect and intro
  .state('redirect', {
    url: '/redirect',
    templateUrl: 'templates/redirect.html',
    controller: 'RedirectCtrl'
  })

  .state('intro', {
    url: '/intro/:mode',
    templateUrl: 'templates/intro.html',
    controller: 'AccountCtrl'
  })

  // settings and other
  .state('other', {
    url: '/other',
    abstract: true,
    templateUrl: 'templates/menu-other.html',
    controller: 'AppCtrl'
  })
  
  .state('other.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/auth/account.html',
        controller: 'AccountCtrl'
      }
    }
  })
  

  .state('other.submit', {
    url: '/submit/:productId',
    views: {
      'menuContent': {
        templateUrl: 'templates/submit.html',
        controller:'SubmitCtrl',
        resolve: {authResolve: authResolve}
      }
    }
  })
  
  .state('other.submissions', {
    url: '/submissions',
    views: {
      'menuContent': {
        templateUrl: 'templates/submissions.html',
        controller: 'SubmissionsCtrl',
        resolve: {authResolve: authResolve}
      }
    }
  })
  
  .state('other.search', {
    url: '/search/:q',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      }
    }
  })
  
  // browsing states
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.live', {
    url: '/live',
    views: {
      'app-live': {
        templateUrl: 'templates/live.html',
        controller: 'LiveCtrl'
      }
    }
  })
  .state('app.trending', {
    url: '/trending',
    views: {
      'app-trending': {
        templateUrl: 'templates/trending.html',
        controller: 'LiveCtrl'
      }
    }
  })
  .state('app.wallet', {
    url: '/wallet',
    views: {
      'app-wallet': {
        templateUrl: 'templates/wallet.html',
        controller: 'WalletCtrl'
      }
    }
  })
  
  .state('app.product', {
    url: '/product/:productId',
    views: {
      'app-live': {
        templateUrl: 'templates/product.html',
        controller: 'ProductCtrl'
      }
    }
  })
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/redirect');
})


.controller('AppCtrl', function(
  $scope, $state) {
    
  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };

});