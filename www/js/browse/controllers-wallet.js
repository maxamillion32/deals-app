angular.module('starter.controllers-wallet', [])

// Upon entering the app, this controller checks whether
// 1. user is authenticated
// 2. if authenticated, has filled in intro-settings
.controller('WalletCtrl', function(
  $scope, $state,
  Auth, Products, Utils, Wallet) {

  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: true,
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.AuthData = Auth.AuthData;
    $scope.loadWalletMeta();
    console.log('in')
  });
  
  $scope.doRefresh = function() {
    $scope.loadWalletMeta();
  };

  $scope.ProductsMeta = {};
  $scope.ProductsImage = {};
  
  // fn latest
  $scope.loadWalletMeta = function() {
    $scope.status['loading'] = true;
    
    if($scope.AuthData.hasOwnProperty('uid')) {
      
      Wallet.getProductsMeta($scope.AuthData.uid).then(
        function(ProductsMeta){ 
          console.log(ProductsMeta)
          if(ProductsMeta != null) {
            
              $scope.ProductsMeta  = Utils.sortArray(Utils.arrayValuesAndKeysProducts(ProductsMeta), 'desc', 'timestamp_creation');
              $scope.status['loading'] = false;
              $scope.$broadcast('scroll.refreshComplete');
              
              // @dependency
              loadProductsIcons(ProductsMeta)
              bindWalletList(ProductsMeta);
              
          } else {
              $scope.status['loading'] = null;
              $scope.$broadcast('scroll.refreshComplete');
          };
        },
        function(error){
          console.log(error)
          if(error == null) {
              $scope.status['loading'] = null;
              $scope.$broadcast('scroll.refreshComplete');
          } else {
              $scope.status['loading'] = false;
              $scope.$broadcast('scroll.refreshComplete');
          }
        }
      );
      
    } else {
      $scope.status['loading'] ='signed-out';
    }
    
    
  };
    
  // custom functions to avoid Lexer error
  // https://docs.angularjs.org/error/$parse/lexerr?p0=Unterminated
  $scope.getProductsMeta = function(key) {
      return $scope.ProductsMeta[key];
  };
  $scope.getProductImage = function(productId) {
    if($scope.ProductsImage.hasOwnProperty(productId)) {
      return $scope.ProductsImage[productId].screenshot1;
    }
  };
  $scope.getProductIcon = function(productId) {
    if($scope.ProductsImage.hasOwnProperty(productId)) {
      return $scope.ProductsImage[productId].icon;
    }
  };
  
  function loadProductsIcons(ProductsMeta) {
    angular.forEach(ProductsMeta, function(value, productId){
      Products.getProductIcon(productId).then(
        function(ProductImages){
          if(ProductImages != null) {
            $scope.ProductsImage[productId] = ProductImages;
          }
        }
      )
    })
  };
  
  $scope.Wallet = {};
  function bindWalletList(ProductsMeta) {
    angular.forEach(ProductsMeta, function(value, productId){
      $scope.Wallet[productId] = true;
    })
  };
  

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  
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
  
  $scope.goToProduct = function(productId) {
    $state.go('app.product', {productId: productId})
  };

});
