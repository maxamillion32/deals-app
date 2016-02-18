angular.module('starter.controllers-search', [])

// Upon entering the app, this controller checks whether
// 1. user is authenticated
// 2. if authenticated, has filled in intro-settings
.controller('SearchCtrl', function(
  $scope, $state, $stateParams,
  Auth, Products, Utils, Wallet) {

  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: false,
    sortMethod: 'timestamp_creation',
    q: $stateParams.q
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.AuthData = Auth.AuthData;
    $scope.status['q'] = $stateParams.q;
    $scope.search();
    loadWallet();
  });

  $scope.ProductsMeta = {};
  $scope.ProductsIcons = {};
  $scope.ProductsScreenshots = {};
  
  // fn latest
  $scope.search = function() {
    $scope.status['loading'] = true;
    if($scope.status['q']) {
      Products.search($scope.status['q'], 25).then(  // shows only last 25
        function(ProductsMeta){ 
          console.log(ProductsMeta)
          if(ProductsMeta != null) {
              
              $scope.ProductsMeta  = Utils.formatSearchResults(ProductsMeta); //Utils.sortArray(Utils.arrayValuesAndKeysProducts(ProductsMeta), 'desc', $scope.status['sortMethod']);
              $scope.status['loading'] = false;
              
              console.log($scope.ProductsMeta)
  
              // @dependency
              loadProductsScreenshots_Adj($scope.ProductsMeta)
          } else {
              $scope.status['loading'] = null;
          };
        },
        function(error){
          if(error == null) {
              $scope.status['loading'] = null;
          } else {
              $scope.status['loading'] = false;
          }
          console.log(error)
        }
      ) // .search()
    } else {
      $scope.status['loading'] = false;
    } // if q
  };
  
  
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
    
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
  function loadProductsScreenshots_Adj(ProductsMeta) {
    if(ProductsMeta != null) {
      for(var i=0; i<ProductsMeta.length; i++) {
        var productId = ProductsMeta[i].key;
        Products.getProductIconLarge(productId).then(
          function(ProductImages){
            //
            if(ProductImages != null && ProductImages != undefined) {
              $scope.ProductsScreenshots[ProductImages.productId] = ProductImages.screenshot1;
            }
          }
        )
      }
    }
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
  
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------

  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };
  
  $scope.goToProduct = function(productId) {
    $state.go('app.product', {productId: productId})
  };

});
