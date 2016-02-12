angular.module('starter.controllers-redirect', [])

// Upon entering the app, this controller checks whether
// 1. user is authenticated
// 2. if authenticated, has filled in intro-settings
.controller('RedirectCtrl', function(
  $scope, $state,
  $ionicHistory,
  Auth, Profile, Codes, Utils) {

  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: true,
    mode: 0,  //0: signed out, 1: signed in (not set intro-settings)
  };


  /**
  * ---------------------------------------------------------------------------------------
  * Monitoring state
  * ---------------------------------------------------------------------------------------
  */

  $scope.$on('$ionicView.enter', function(e) {
    checkState();
  });

  // fn0: is the user authenticated?
  function checkState() {
    $scope.AuthData = Auth.AuthData;
    if(!$scope.AuthData.hasOwnProperty('uid')){
      Auth.getAuthState().then(
        function(AuthData){
          $scope.AuthData = AuthData;
          handleLoggedIn();
        },
        function(notLoggedIn){
          handleLoggedOut();
        }
      )
    } else {
      handleLoggedIn();
    };
  }; // ./ checkAuth()

  function handleLoggedIn() {
    loadProfileData(); // -->
  };
  function handleLoggedOut() {
    $scope.status['mode'] = 0;
    goToNextState();
  };
  
  // fn0: has the user setup his intro-settings?
  $scope.ProfileData = {};
  function loadProfileData() {
    Profile.get($scope.AuthData.uid).then(
      function(ProfileData) {
        
        // bind to scope
        if(ProfileData != null) {
          $scope.ProfileData = ProfileData;
        } else {
          handleProfileNotSet();
        };
        
        // @dependency
        // Must have set intro settings
        if($scope.ProfileData.hasOwnProperty('other')) {
          handleProfileSet();
        } else {
          handleProfileNotSet();
        };
        
        // switch off loading
        $scope.status['loading'] = false;
      }
    ),
    function(error){
      console.log(error);
      Codes.handleError();
      $scope.status['loading'] = false;
    }
  };
  
  function handleProfileSet() {
    $scope.status['mode'] = 2;
    goToNextState();
  };
  function handleProfileNotSet() {
    $scope.status['mode'] = 1;
    goToNextState();
  };
  
  function goToNextState() {
    // Do not animate the next transitio and forget the back view
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    if($scope.status['mode'] != 2) {
      $state.go('intro', {mode: $scope.status['mode']});
    } else {
      $state.go('app.live');
    }
  };

});
