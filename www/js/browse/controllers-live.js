angular.module('starter.controllers-live', [])

// Upon entering the app, this controller checks whether
// 1. user is authenticated
// 2. if authenticated, has filled in intro-settings
.controller('LiveCtrl', function(
  $scope, $state,
  $ionicSlideBoxDelegate,
  Auth, Products, Utils) {

  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: {},
    mode: 0,  //0: signed out, 1: signed in (not set intro-settings)
  };

  $scope.$on('$ionicView.enter', function(e) {
    
  });
  
  $scope.doRefresh = function() {
    
    
    $scope.loadLatest('local');
    $scope.loadLatest('online');
    $scope.loadLatest('voucher');
    
  };
  
  
  $scope.slideRepeat = {};
  $scope.ProductsMeta = {};
  $scope.ProductsImage = {};
  
  // fn latest
  $scope.loadLatest = function(productType) {
    $scope.status['loading'][productType] = true;
    Products.filter('productType', productType, 'timestamp_update', LIMITVALUE).then(
      function(ProductsMeta){ 
        // Init view
        if(ProductsMeta != null) {
          
            $scope.ProductsMeta[productType] = Utils.arrayValuesAndKeysProducts(ProductsMeta);
            $scope.slideRepeat[productType] = Utils.prepareSlideRepeat($scope.ProductsMeta[productType]);
            
            $scope.status['loading'][productType] = false;
            $scope.$broadcast('scroll.refreshComplete');
            
            
            console.log('done', productType)
            
            // @dependency
            loadProductsImage(ProductsMeta)
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
    if($scope.ProductsImage.hasOwnProperty(productId)) {
      return $scope.ProductsImage[productId].screenshot1;
    }
  };
  
  
  
  function loadProductsImage(ProductsMeta) {
    angular.forEach(ProductsMeta, function(value, productId){
      Products.getProductScreenshots(productId).then(
        function(ProductImages){
          if(ProductImages != null) {
            $scope.ProductsImage[productId] = ProductImages;
          }
        }
      )
    })
  };
  
  
  
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  
  $scope.FeaturedProductsMeta = {};
  $scope.loadFeaturedItems = function(productType) {
    $scope.status['loading']['featured'] = true;
    
    Products.getFeaturedProductMeta(productType).then(
      function(ProductsMeta){ 
        if(ProductsMeta != null) {
          $scope.FeaturedProductsMeta[productType] = Utils.arrayValuesAndKeysProducts(ProductsMeta);
          console.log($scope.FeaturedProductsMeta)
          $scope.status['loading']['featured'] = false;
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
  

  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };

});
