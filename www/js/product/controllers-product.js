angular.module('starter.controllers-product', [])

// Product Management
.controller('ProductCtrl', function(
  $scope, $state, $stateParams, $timeout,
  Auth, Products, Utils, Wallet, Comments, Upvotes, ShareFactory) {

  // ----
  // Init other

  // global variables
  $scope.AuthData = Auth.AuthData;

  // communicates with the DOM
  $scope.status = {
    loading: true,
    commentsLoaded: false,
    commentsLoading: false,
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.AuthData = Auth.AuthData;
    $scope.productId = $stateParams.productId;
    
    // additional
    loadProduct();
    loadIndexValues();
    loadScreenshot();
    loadWallet_Indiv();
  });
  
  $scope.doRefresh = function() {
    
    // additional w/
    loadProduct();
    loadIndexValues();
    loadScreenshot();
    loadWallet_Indiv();
  };

  $scope.ProductsMeta = {};
  $scope.ProductsIcons = {};
  $scope.ProductsScreenshots = {};
  $scope.ProductsIndexValues = {};
  $scope.FormData = {};
  
  // fn meta
  function loadProduct() {
    if($scope.productId != undefined) {
      $scope.status['loading'] = true;
      Products.getProductMeta($scope.productId).then(
        function(ProductMeta){
          $scope.ProductsMeta[$scope.productId] = ProductMeta;
          $scope.status['loading'] = false;
          $scope.$broadcast('scroll.refreshComplete');
          
          // @dependency
          formatData();
        },
        function(error){
          if (error != null) {
            $scope.status['loading'] = false;
          } else {
            $scope.status['loading'] = null;
          }
        })
    } else {
      $state.go('app.live');
    }
  };
  
  // fn meta v2
  function formatData() {
    $scope.ProductsMeta[$scope.productId]['tags'] = Utils.formatTagsString($scope.ProductsMeta[$scope.productId]['tagsString'])
  };
  
  // fn image
  function loadScreenshot() {
    if($scope.productId != undefined) {
      Products.getProductIconLarge($scope.productId).then(
        function(ProductImages){
          if(ProductImages != null) {
            $scope.ProductsScreenshots[$scope.productId] = ProductImages.screenshot1;
          }
        }
      )
    }
  };
  
  // fn index
  function loadIndexValues() {
    if($scope.productId != undefined) {
      Products.getIndexValues($scope.productId).then(
        function(ProductIndexValues){
          $scope.ProductsIndexValues[$scope.productId] = ProductIndexValues;
        },
        function(error){
          console.log(error)
        })
    }
  };
  
  // fn comments
  $scope.loadComments = function() {
    
    $scope.status['commentsLoaded'] = true;
    $scope.status['commentsLoading'] = true;
    
    Comments.load($scope.productId).then(
      function(ProductComments) {
          
          
          $scope.ProductComments = Utils.formatComments(ProductComments);
          $scope.status['commentsLoading'] = false;
          
          
          // @dependencies
          loadProfiles($scope.ProductComments);
          
      }, 
      function(error){
          console.log('failed loading comments', error);
          $scope.status['commentsLoading'] = false;
      }
  );
  
  $scope.getCommentProfile = function(userId) {
      return $scope.ProductCommentsProfiles[userId]
    };
  
  //
  function loadProfiles(ProductComments) {
      $scope.ProductCommentsProfiles = {};
      Comments.loadProfiles(ProductComments).then(
          function(CommentsProfiles){
            //var tkeys = Object.keys(CommentsProfiles);
            $scope.ProductCommentsProfiles = CommentsProfiles;
          },
          function(error){
              console.log('failed loading profiles', error)
          }
      )
  }
        
  };
  
  $scope.addComment = function() {
    if ($scope.AuthData.hasOwnProperty('uid') && $scope.FormData.commentValue) {
      
      var commentObj = {
        timestamp: Firebase.ServerValue.TIMESTAMP,
        message: $scope.FormData.commentValue,
      };
      
      Comments.post($scope.productId, $scope.AuthData.uid, commentObj).then(
        function(success){
          // success handler
          $scope.FormData['commentValue'] = "";
          $scope.loadComments();
        },
        function(error){
          console.log(error);
        }
      )
     
      
    }
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
  
  
  
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  
  $scope.Wallet = {};
  function loadWallet_Indiv() {
    if($scope.AuthData.hasOwnProperty('uid')) {
      Wallet.getList_Indiv($scope.AuthData.uid, $scope.productId).then(
        function(WalletList){
          console.log(WalletList)
          $scope.Wallet[$scope.productId] = WalletList;
        },
        function(error){
          if(error != null) {
            console.log(error);
          }
        }
      )
    }
  };

  // ** can be put in service for consistency
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
  
  $scope.upVote = function(productId) {
    if($scope.AuthData.hasOwnProperty('uid')) {
      Upvotes.post(productId, $scope.AuthData.uid).then(
        function(success){
          $timeout(function(){
            loadIndexValues();
          }, 1250)
        },
        function(error){
          console.log(error)
        })
    }
  };
  
  $scope.formatTimestamp = function(timestamp) {
    return Utils.formatTimestamp(timestamp)
  };

  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };
  
  $scope.goToTag = function(tag) {
    $state.go('other.search', {q: tag.trim()})
  };
  
  $scope.goToProduct = function(productId) {
    $state.go('app.product', {productId: productId})
  };
  
  $scope.shareGeneral = function(productId) {
    ShareFactory.shareGeneral($scope.ProductsMeta[productId], $scope.ProductsScreenshots[productId]);
  };

});
