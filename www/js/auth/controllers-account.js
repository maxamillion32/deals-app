angular.module('starter.controllers-account', [])

.controller('AccountCtrl', function(
  $rootScope, $scope, $state, $stateParams, $timeout, 
  $ionicModal, $ionicHistory, $ionicPopup, $ionicActionSheet,
  Auth, Profile, Codes, Utils, Personal) {

  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: true,
    loadingProfile: true,
    changePasswordMode: "lost",
    updateMessage: "Update account", //default
    updateButtonClass: 'button-positive', //default
    toggleLoginManual: false,
    mode: $stateParams.mode,
    loadPersonalOptionsMessage: "",
  };


  /**
  * ---------------------------------------------------------------------------------------
  * AuthState monitoring
  * ---------------------------------------------------------------------------------------
  */

  $scope.$on('$ionicView.enter', function(e) {
    
    if($state.current.name == 'account') {
      checkAuth();
    } else {
      handleIntro();
    }

  });

  // monitor and redirect the user based on its authentication state
  function checkAuth() {
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

  // when in intro mode
  function handleIntro(overMode) {
    if(overMode == undefined) {
      $scope.status['mode'] = $stateParams.mode;
    }
    console.log('handle intro', $scope.status['mode'])
    loadProfileData();
  };
  
  // handles when the user is logged in
  function handleLoggedIn() {

    // @dependency
    loadProfileData();

    // proceed to next state if specified (for instance when user comes from foreign state)
    if($stateParams.nextState != undefined && $stateParams.nextState != null && $stateParams.nextState != "") {
      $state.go($stateParams.nextState);
    };
  };

  // handles when the user is logged out
  function handleLoggedOut() {
    
    if($state.current.name == 'account') {
      openLogin();
      // if for some reason the modals are not automatically opened, show a button
      $timeout(function(){
        $scope.status['toggleLoginManual'] = true;
      }, 1500);
    };
    
    $scope.status['loadingProfile'] = false;

  };

  // update auth status in other controllers
  function broadcastAuthChange() {
    $rootScope.$broadcast('rootScope:authChange', {});
  };

  
  /**
  * ---------------------------------------------------------------------------------------
  * MODAL: Login
  * ---------------------------------------------------------------------------------------
  */

  // Form data for the login modal
  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('templates/auth/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    $state.go('app.live');
  };

  // Open the login modal
  $scope.login = function() {
    openLogin();
  };
  function openLogin() {
    if($scope.modal != undefined) {
      $scope.modal.show();
    } else {
      $timeout(function(){
        openLogin();
      }, 1500)
    }
  };

  $scope.unAuth = function() {
    Auth.unAuth();
    
    $scope.AuthData = {};
    $scope.ProfileData = {};
    
    $scope.loginData = {};  
    $scope.signUpData = {};           $scope.closeSignUp();
    $scope.changeEmailData = {};      $scope.closeChangeEmail();
    $scope.changePasswordData = {};   $scope.closeChangePassword();
    $scope.setProfileData = {};       $scope.closeSetProfile();
    $scope.ProfileData = {};
    $scope.OtherData = {};
    
    broadcastAuthChange();
    handleLoggedOut();
  };

  // Perform the login action when the user submits the login form
  
  $scope.doLoginSocial = function(provider) {
    Auth.signInSocial(provider).then(
      function(AuthData){
        // -->
        proceedLogin(AuthData);
      },
      function(error){
        Codes.handleError(error);
      }
    )
  };
  
  $scope.doLogin = function() {
    if($scope.loginData.userEmail && $scope.loginData.userPassword) {
      Utils.showMessage("Signing in user... ");
      Auth.signInPassword($scope.loginData.userEmail, $scope.loginData.userPassword).then(
        function(AuthData){
          
          // -->
          proceedLogin(AuthData);
          
        },
        function(error){
          Codes.handleError(error);
        }
      )
    }
  };
  
  // wrapper for email and social login
  function proceedLogin(AuthData) {
    // hide modals
    $scope.modal.hide();
    $scope.modalSignUp.hide();
    $scope.modalChangePassword.hide();

    broadcastAuthChange();
    Utils.showMessage("Signed in!", 500);

    // handle logged in
    $scope.AuthData = AuthData;
    console.log('proceedLogin', $state.current.name)
    if ($state.current.name == 'account') {
      handleLoggedIn();
    } else {
      $scope.status['mode'] = 1;
      handleIntro(true);
    }
  };


  // ---------------------------------------------------------------------------
  //
  // MODAL: Sign Up
  //
  // ---------------------------------------------------------------------------

  // Form data for the signUp modal
  $scope.signUpData = {};

  // Create the signUp modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalSignUp = modal;
  });
  $scope.closeSignUp = function() {
    $scope.modalSignUp.hide();
    $scope.modal.show();
  };
  $scope.signUp = function() {
    console.log('test')
    $scope.modal.hide();
    $scope.modalSignUp.show();
  };
  $scope.doSignUp = function() {       console.log('Doing signUp', $scope.signUpData);
    if($scope.signUpData.userEmail && $scope.signUpData.userPassword) {
        Utils.showMessage("Creating user... ");
        Auth.signUpPassword($scope.signUpData.userEmail, $scope.signUpData.userPassword).then(
            function(AuthData){

                $scope.loginData = $scope.signUpData;
                $scope.doLogin();

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };



  // ---------------------------------------------------------------------------
  //
  // MODAL: Change Password
  //
  // ---------------------------------------------------------------------------

  // Form data for the signUp modal
  $scope.changePasswordData = {};

  // Create the signUp modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/change-password.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChangePassword = modal;
  });
  $scope.closeChangePassword = function() {
    $scope.modalChangePassword.hide();
    if($scope.status.changePasswordMode == 'lost') {
      $scope.modal.show();
    }
  };
  $scope.changePassword = function(mode) {
    // when authenticated
    if($scope.AuthData.hasOwnProperty('password')){
      $scope.changePasswordData = {
          userEmail: $scope.AuthData.password.email
      }
    }
    $scope.status['changePasswordMode'] = mode;
    $scope.modal.hide();
    $scope.modalChangePassword.show();
  };

  //
  // step 1: reset password
  //
  $scope.resetPassword = function() {
      if($scope.changePasswordData.userEmail) {
        Utils.showMessage("Resetting password");
        Auth.resetPassword(
            $scope.changePasswordData.userEmail).then(
            function(success){
                Utils.showMessage("Password has been reset. Please check your email for the temporary password", 2000);
                $scope.status['changePasswordMode'] = 'change';
            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };

  //
  // step 2: change password
  //
  $scope.doChangePassword = function() {
    if($scope.changePasswordData.userEmail && $scope.changePasswordData.oldPassword && $scope.changePasswordData.newPassword) {
        Utils.showMessage("Changing password... ");
        Auth.changePassword(
            $scope.changePasswordData.userEmail,
            $scope.changePasswordData.oldPassword,
            $scope.changePasswordData.newPassword).then(
            function(AuthData){

                //
                Utils.showMessage("Password Changed!");
                //
                $scope.loginData = {
                    userEmail:      $scope.changePasswordData.userEmail,
                    userPassword:   $scope.changePasswordData.newPassword,
                }
                $scope.doLogin();

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };


  // ---------------------------------------------------------------------------
  //
  // MODAL: Change E-mail
  //
  // ---------------------------------------------------------------------------

  // Form data for the login modal
  $scope.changeEmailData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/change-email.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalChangeEmail = modal;
  });
  $scope.closeChangeEmail = function() {
    $scope.modalChangeEmail.hide();
  };
  $scope.changeEmail = function() {
    // when authenticated
    if($scope.AuthData.hasOwnProperty('password')){
        $scope.changeEmailData = {
            oldEmail: $scope.AuthData.password.email
        }
    }
    $scope.modal.hide();
    $scope.modalChangeEmail.show();
  };
  $scope.doChangeEmail = function() {       console.log('changeEmail', $scope.changeEmailData);
    if($scope.changeEmailData.oldEmail && $scope.changeEmailData.newEmail && $scope.changeEmailData.userPassword) {

        Utils.showMessage("Changing e-mail...")

        Auth.changeEmail(
            $scope.changeEmailData.oldEmail,
            $scope.changeEmailData.newEmail,
            $scope.changeEmailData.userPassword).then(
            function(success){

                //
                $scope.closeChangeEmail();
                Utils.showMessage("E-mail changed!", 500)

            }, function(error){
                Codes.handleError(error)
            }
        )
    } else {
        Codes.handleError({code: "INVALID_INPUT"})
    }
  };
  
  
  
  
  // ---------------------------------------------------------------------------
  //
  // MODAL: Set username and displayname
  //
  // ---------------------------------------------------------------------------

  // Form data for the login modal
  $scope.setProfileData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth/change-profile.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalSetProfile = modal;
  });
  
  $scope.closeSetProfile = function() {
    $scope.modalSetProfile.hide();
  };
  
  $scope.setProfile = function() {
    openSetProfile();
  };
  function openSetProfile() {
    if($scope.modalSetProfile != undefined) {
      $scope.modalSetProfile.show();
    } else {
      $timeout(function(){
        openSetProfile();
      }, 1500)
    }
  };
  
  $scope.finishSetProfile = function() {
    if($scope.ProfileData.hasOwnProperty('meta')){
      if($scope.ProfileData.meta.hasOwnProperty('username') && $scope.ProfileData.meta.hasOwnProperty('displayName')) {
        $scope.modalSetProfile.hide();
        $state.go('app.dash');
      } else {
        Codes.handleError({code: "PROFILE_NOT_SET"})
      }
    } else {
      Codes.handleError({code: "PROFILE_NOT_SET"})
    }
  };
  
  
  
  
  
  
  
  /**
  * ---------------------------------------------------------------------------------------
  * Update profile (delivery details in this exercise)
  * ---------------------------------------------------------------------------------------
  */

  $scope.ProfileData = {};
  function loadProfileData() {
    $scope.status['loadingProfile'] = true;
    if($scope.AuthData.hasOwnProperty('uid')){
      Profile.get($scope.AuthData.uid).then(
        function(ProfileData) {
          
          console.log(ProfileData)
          
          // bind to scope
          if(ProfileData != null) {
            $scope.ProfileData = ProfileData;
            
            
            if($scope.ProfileData.hasOwnProperty('other')) {
              $scope.OtherData = $scope.ProfileData.other;
            }
            
          };
          
          // set a temporary username and displayname
          tempMeta(ProfileData);
          
          //
          $scope.status['loadingProfile'] = false;
          $scope.status['loading'] = false;
        }
      ),
      function(error){
        $scope.status['loadingProfile'] = false;
        $scope.status['loading'] = false;
      }
    };
  };
  
  // temporary sets an username and displayname if user has not specified it
  function tempMeta(ProfileData) {
    // set manual display name or username
    if(ProfileData != null) {
      if(!ProfileData.hasOwnProperty('meta')){
        fnSet();
      };
    } else {
      fnSet();
    };
    
    function fnSet() {
      var tempName = Utils.genRandomName();
      if($scope.AuthData.provider == 'facebook') {
        importFacebook(ProfileData, tempName);
      } else {
        var objMeta = {
          'username': tempName,
          'displayName': tempName
        }
        Profile.setGlobal($scope.AuthData.uid, 'meta', objMeta);
        $scope.ProfileData['meta'] = objMeta;
      };
    };
  };
  
  
  function importFacebook(ProfileData, optUsername) {
    console.log('import facebook');
    console.log($scope.AuthData);
    
    // set facebook
    Profile.setGlobal($scope.AuthData.uid, 'facebook', $scope.AuthData.facebook);
    $scope.ProfileData['facebook'] = $scope.AuthData.facebook;
    
    // set meta
    var objMeta = {
      'username': optUsername,
      'displayName': $scope.AuthData.facebook.displayName
    }
    Profile.setGlobal($scope.AuthData.uid, 'meta', objMeta);
    $scope.ProfileData['facebook'] = $scope.AuthData.facebook;
    $scope.ProfileData['meta'] = objMeta;
    
    // set profile image
    Profile.setGlobal($scope.AuthData.uid, 'profilePicture', $scope.AuthData.facebook.profileImageURL);
    $scope.ProfileData['profilePicture'] = $scope.AuthData.facebook.profileImageURL;
    
  };
  
  $scope.importFacebookNew = function() {
    importFacebook(null, $scope.ProfileData.meta.username);
  };
  
  // popup generic
  var myPopup;
  $scope.popupData = {};
  function showPopup(title, inputStr) {
    $scope.popupData['inputStr'] = inputStr;
    myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="popupData.inputStr">',
    title: title,
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.popupData.inputStr) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.popupData.inputStr;
          }
        }
      }
    ]
    });
  }
  
  // fn change 
  $scope.changeDisplayName = function() {
    showPopup('Change display name', preparePopupData('meta', 'displayName'));
    myPopup.then(function(newDisplayName) {
      if(newDisplayName != undefined && newDisplayName != null) {
        Profile.setSub($scope.AuthData.uid, "meta", "displayName", newDisplayName).then(
          function(success){
            loadProfileData();
          }
        );
      };
    });
  };

  // fn change username
  $scope.changeUsername = function() {
    showPopup('Change username', preparePopupData('meta', 'username'));
    myPopup.then(function(newUsername) {
      if(newUsername != undefined && newUsername != null) {
        Profile.changeUserName($scope.AuthData.uid, newUsername).then(
          function(returnObj){
            if(returnObj != "USERNAME_TAKEN") {
              loadProfileData();
            } else {
              $timeout(function(){
                $scope.changeUsername();  //reopen
              }, 1500)
            }
          }
        )
      }
    });
  };
  
  // fn helper
  function preparePopupData(globalProperty, subProperty){
    if($scope.ProfileData.hasOwnProperty(globalProperty)){
      if($scope.ProfileData[globalProperty].hasOwnProperty(subProperty)){
        return $scope.ProfileData[globalProperty][subProperty];
      } else { return "";};
    } else { return "";};
  };

  // fn update profile picture
  $scope.changeProfilePicture = function() {
    // Show the action sheet
    $ionicActionSheet.show({
        buttons: [
            { text: 'Take a new picture' },
            { text: 'Import from phone library' },
        ],
        titleText: 'Change your profile picture',
        cancelText: 'Cancel',
        cancel: function() {
            // add cancel code..
        },
        buttonClicked: function(sourceTypeIndex) {
            proceed(sourceTypeIndex)
            return true;
        }
    });
    function proceed(sourceTypeIndex) {
      Profile.changeProfilePicture(sourceTypeIndex, $scope.AuthData.uid).then(
        function(success){
          loadProfileData();
        }
      );
    };
  };
  
  
  
  /**
  * ---------------------------------------------------------------------------------------
  * Update other settings
  * ---------------------------------------------------------------------------------------
  */
  
  $ionicModal.fromTemplateUrl('templates/auth/change-account-other.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.otherModal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeOther = function() {
    $scope.otherModal.hide();
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    
    if($state.current.name == 'account') {
      $state.go('account');
    } else {
      $state.go('app.live');
    }
    
  };

  // Open the login modal
  $scope.other = function() {
    openOther();
  };
  function openOther() {
    if($scope.otherModal != undefined) {
      $scope.otherModal.show();
      loadOtherData();
    } else {
      $timeout(function(){
        openOther();
      }, 1500)
    }
  };

  $scope.OtherData = {};      // data loaded from user in users/:uid/other
  $scope.OtherDataForm = {};  // used for search in autocomplete form
  function loadOtherData() {
    $scope.status['loadingOtherData'] = true;
    if($scope.AuthData.hasOwnProperty('uid')){
      Profile.get($scope.AuthData.uid).then(
        function(ProfileData) {
          
          // bind to scope
          if(ProfileData != null) {
            $scope.ProfileData  = ProfileData;
            if(ProfileData.hasOwnProperty('other')) {
              $scope.OtherData    = ProfileData.other;
              prepareSelected();
            }
          };
          
          $scope.status['loadingOtherData'] = false;
        }
      ),
      function(error){
        $scope.status['loadingOtherData'] = false;
      }
    };
  };
  
  
  function saveOtherData() {
    if($scope.OtherData) {
      Profile.setGlobal($scope.AuthData.uid, 'other', $scope.OtherData).then(
        function(success){
          //$scope.OtherDataForm.things_raw = "";
          console.log('yuhu')
        },
        function(error){
          console.log('error saving data');
        }
      )
    }
  };

  
  // autocomplete form to load pre-defined options (settings/personal/:personalField)
  // ** todo: rename it to personal settings
  $scope.PersonalOptions = {
    'locations': [],
    'things': [],
    'brands': []
  };
  
  $scope.loadPersonal = function(personalField) {
    console.log('loadPersonal', personalField)
    // load once per personalField
    
    if(!$scope.PersonalOptions[personalField] || $scope.PersonalOptions[personalField].length <= 0) {
      $scope.status['loadingPersonalOptions'] = true;
      Personal.get(personalField).then(
        function(matches){
          console.log('matches', matches)
          $scope.status['loadingPersonalOptions'] = false;
          $scope.PersonalOptions[personalField] = matches;
        },
        function(error){
          console.log(error)
          $scope.status['loadingPersonalOptions'] = false;
          $scope.status['loadPersonalOptionsMessage'] = "Something went wrong.. unable to retrieve options";
      })
    };
    
  };
  
  $scope.addToOther = function(personalField, value) {
    if($scope.OtherData.hasOwnProperty(personalField)) {
      if(!Utils.isInArray(value, $scope.OtherData[personalField])) {
        $scope.OtherData[personalField].push(value);
        saveOtherData();
        $scope.SelectedOther[personalField][value] = true;
      }
    } else {
      $scope.OtherData[personalField] = [value];
      $scope.SelectedOther[personalField][value] = true;
      saveOtherData();
    }
    console.log($scope.OtherData);
  };
  
  $scope.removeFromOther = function(personalField, value) {
    
    console.log('removeFromOther', 
    value, 
    $scope.OtherData[personalField], 
    $scope.OtherData[personalField].indexOf(value))
    
    if($scope.OtherData.hasOwnProperty(personalField)) {
      $scope.SelectedOther[personalField][value] = false;
      $scope.OtherData[personalField].splice($scope.OtherData[personalField].indexOf(value),1);
      saveOtherData();
    };
    console.log($scope.SelectedOther);
  };
  
  $scope.capitalizeFirstLetter = function(input) {
    return Utils.capitalizeFirstLetter(input);
  };
  
  // do not display selected in search results
  $scope.SelectedOther = {
    'locations': {},
    'things': {},
    'brands': {}
  };
  function prepareSelected() {
    angular.forEach($scope.OtherData, function(value, personalField) {
      $scope.SelectedOther[personalField] = {};
      for (var i=0; i<$scope.OtherData[personalField].length; i++) {
        $scope.SelectedOther[personalField][$scope.OtherData[personalField][i]] = true;
      }
    })
    console.log($scope.SelectedOther);
  };
  
  
  
  // ---------------------------------------------------------------------------
  // Intro
  $scope.skipIntro = function() {
    $state.go('app.live');
  };

  $scope.goTo = function(nextState) {
    $state.go(nextState);
  };

});
