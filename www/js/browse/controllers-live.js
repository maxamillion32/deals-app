angular.module('starter.controllers-live', [])

// Upon entering the app, this controller checks whether
// 1. user is authenticated
// 2. if authenticated, has filled in intro-settings
.controller('LiveCtrl', function(
  $scope, $state,
  $ionicSlideBoxDelegate,
  Auth, Products, Utils, Wallet) {

  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    sortMethod: 'timestamp_creation',
    loading: {},
    mode: 0,  //0: signed out, 1: signed in (not set intro-settings)
  };

  $scope.$on('$ionicView.enter', function(e) {
    
    // define the state and sorting preference
    console.log($state.current.name)
    if ($state.current.name == 'app.live') {
      $scope.status['sortMethod'] = 'upvotes_count';
    } else {
      $scope.status['sortMethod'] = 'timestamp_creation';
    };
    
    // load the groups
    $scope.loadLatest('local');
    $scope.loadLatest('online');
    $scope.loadLatest('voucher');
    $scope.loadFeaturedItems('live');
    loadWallet();
    
  });
  
  $scope.doRefresh = function() {
    $scope.loadLatest('local', false);
    $scope.loadLatest('online', false);
    $scope.loadLatest('voucher', false);
    $scope.loadFeaturedItems('live', false);
    loadWallet();
  };

  $scope.slideRepeat = {};
  $scope.ProductsMeta = {};
  $scope.ProductsIcons = {};
  $scope.ProductsScreenshots = {};
  
  // fn latest
  $scope.loadLatest = function(productType, optHide) {
    //console.log('loading latest', productType, $scope.status['sortMethod'])
    if(optHide == undefined || optHide != false) {  // prevent flickering
      $scope.status['loading'][productType] = true;
    };
    // generic wrapper
    Products.filter('productType', productType, $scope.status['sortMethod'], 25).then(  // shows only last 25
      function(ProductsMeta){ 
        if(ProductsMeta != null) {
          
            $scope.ProductsMeta[productType]  = Utils.sortArray(Utils.arrayValuesAndKeysProducts(ProductsMeta), 'desc', $scope.status['sortMethod']);
            $scope.slideRepeat[productType]   = Utils.prepareSlideRepeat($scope.ProductsMeta[productType]);
            
            $scope.status['loading'][productType] = false;
            $scope.$broadcast('scroll.refreshComplete');
            $ionicSlideBoxDelegate.update();
            
            // @dependency
            loadProductsIcons(ProductsMeta)
        } else {
            $scope.status['loading'][productType] = null;
        };
      },
      function(error){
        if(error == null) {
            $scope.status['loading'][productType] = null;
        } else {
            $scope.status['loading'][productType] = false;
        }
        console.log(error)
      }
    );
  };
    
  // custom functions to avoid Lexer error
  // https://docs.angularjs.org/error/$parse/lexerr?p0=Unterminated
  $scope.getProductsMeta = function(key) {
      return $scope.ProductsMeta[key];
  };
  $scope.getProductImage = function(productId) {
    if($scope.ProductsScreenshots.hasOwnProperty(productId)) {
      return $scope.ProductsScreenshots[productId];
    }
  };
  $scope.getProductIcon = function(productId) {
    if($scope.ProductsIcons.hasOwnProperty(productId)) {
      return $scope.ProductsIcons[productId];
    }
  };
  
  
  
  function loadProductsIcons(ProductsMeta) {
    angular.forEach(ProductsMeta, function(value, productId){
      Products.getProductIcon(productId).then(
        function(ProductImages){
          if(ProductImages != null) {
            $scope.ProductsIcons[productId] = ProductImages.icon;
          }
        }
      )
    })
  };
  function loadProductsScreenshots(ProductsMeta) {
    angular.forEach(ProductsMeta, function(value, productId){
      Products.getProductIconLarge(productId).then(
        function(ProductImages){
          if(ProductImages != null) {
            $scope.ProductsScreenshots[productId] = ProductImages.screenshot1;
          }
        }
      )
    })
  };
  
  
  
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  
  $scope.FeaturedProductsMeta = {};
  $scope.loadFeaturedItems = function(screenView, optHide) {
    if(optHide == undefined || optHide != false) {  // prevent flickering
      $scope.status['loading']['featured'] = true;
    };
    Products.getFeaturedProductMeta(screenView).then(
      function(FeaturedProductsMeta){ 
        if(FeaturedProductsMeta != null) {
          
          $scope.FeaturedProductsMeta[screenView] = Utils.arrayValuesAndKeysProducts(FeaturedProductsMeta);
          
          $scope.status['loading']['featured'] = false;
          $scope.$broadcast('scroll.refreshComplete');
          $ionicSlideBoxDelegate.update();
          
          // @dependency
          loadProductsScreenshots(FeaturedProductsMeta);
          
        } else {
          $scope.status['loading']['featured'] = null;
        };
      },
      function(error){
        if(error == null) {
          $scope.status['loading']['featured'] = null;
        } else {
          $scope.status['loading']['featured'] = false;
        }
        console.log(error)
      }
    )
  };
  
  
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  
  $scope.Wallet = {};
  function loadWallet() {
    if($scope.AuthData.hasOwnProperty('uid')) {
      Wallet.getList($scope.AuthData.uid).then(
        function(WalletList){
          $scope.Wallet = WalletList;
        },
        function(error){
          if(error != null) {
            console.log(error);
          }
        }
      )
    }
  };
  
  var tempPressed = false;
  $scope.walletButtonPressed = function(productId) {
    
    if($scope.AuthData.hasOwnProperty('uid') && !tempPressed) {
      tempPressed = true;
      
      if(!$scope.Wallet[productId]){ // add
        
        Wallet.save($scope.AuthData.uid, productId).then(
          function(success){
            $scope.Wallet[productId] = true;
            tempPressed = false;
          },
          function(error){
            tempPressed = false;
          }
        )
        
      } else { // remove
      
        Wallet.remove($scope.AuthData.uid, productId).then(
          function(success){
            $scope.Wallet[productId] = false;
            tempPressed = false;
          },
          function(error){
            tempPressed = false;
          }
        )
        
      } // end if
    } // end auth and tempPressed
  };
  

  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };

});
