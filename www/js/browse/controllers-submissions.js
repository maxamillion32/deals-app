angular.module('starter.controllers-submissions', [])

// user submissions
.controller('SubmissionsCtrl', function(
  $scope, $state,
  Auth, Products, Utils) {

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
     $scope.loadLatest();
  });
  
  $scope.doRefresh = function() {
    $scope.loadLatest();
  };

  $scope.ProductsMeta = {};
  $scope.ProductsImage = {};
  
  // fn latest
  $scope.loadLatest = function() {
    $scope.status['loading'] = true;
    
    console.log($scope.AuthData.uid)
    Products.filter('userId', $scope.AuthData.uid, 'timestamp_update', LIMITVALUE).then(
      function(ProductsMeta){ 
        // Init view
        if(ProductsMeta != null) {
          
            $scope.ProductsMeta  = Utils.sortArray(Utils.arrayValuesAndKeysProducts(ProductsMeta), 'desc', 'timestamp_creation');
            $scope.status['loading'] = false;
            $scope.$broadcast('scroll.refreshComplete');
            
            // @dependency
            loadProductsIcons(ProductsMeta)
        } else {
            $scope.status['loading'] = null;
            $scope.$broadcast('scroll.refreshComplete');
        };
      },
      function(error){
        if(error == null) {
            $scope.status['loading'] = null;
        } else {
            $scope.status['loading'] = false;
        }
        $scope.$broadcast('scroll.refreshComplete');
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
  function loadProductsScreenshots(ProductsMeta) {
    angular.forEach(ProductsMeta, function(value, productId){
      Products.getProductIconLarge(productId).then(
        function(ProductImages){
          if(ProductImages != null) {
            $scope.ProductsImage[productId] = ProductImages;
          }
        }
      )
    })
  };
  
  $scope.deleteProduct = function(productId) {
    Products.deleteProduct(productId, $scope.AuthData).then(
      function(success){
        $scope.loadLatest();
      })
  };
 

  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };
  
  $scope.editProduct = function(productId) {
    $state.go('other.submit', {productId: productId})
  };

});
