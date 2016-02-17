angular.module('starter.controllers-submit', [])

// submit ctrl (to be harmonized with admin)
.controller('SubmitCtrl', function(
  $scope, $state, $stateParams,
  $ionicActionSheet, CordovaCamera,
  Auth, Products, Utils, Codes, Categories) {

  // controller variables
  //var submit = this;
  var currentProductId = null;   
  
  // init variables 
  $scope.status = {
      editMode: false,
      submitLoading: false,
      generalView: 'loading',
      containsNoError: true,
      loadingScreenshots: true,
      loadingCategories: true,
  };
  $scope.AuthData         = Auth.AuthData;
  $scope.Categories       = Categories;
  $scope.ProductMeta      = {};
  $scope.ProductImages    = {};
  $scope.ErrorMessages    = {};

  // init the dependencies on load
  $scope.$on('$ionicView.enter', function(e) {
    
      currentProductId = $stateParams.productId;
      redirectView();
      loadCategories();
      
  });

  function loadCategories() {
      console.log('load cat')
      Categories.get().then(
          function(success){
              $scope.status['loadingCategories'] = false;
              if($scope.Categories.all != null) {
                  $scope.Categories = $scope.Categories.all;
              }
          },
          function(error){
              console.log(error);
              $scope.status['loadingCategories'] = false;
          }
      );
  };
  
  
  /**
   * Edit mode verification and redirection:
   * - is it in the edit mode?
   * - does product excist?
   * - does author have the right to edit?
   * - submit with new productId or existing
   */
  function redirectView() {
      if($scope.AuthData.hasOwnProperty('uid')){
          if(currentProductId != undefined && currentProductId != null && currentProductId != "") {
              // load product
              Products.getProductMeta(currentProductId).then(
                  function(ProductMeta){
                      if(ProductMeta != null) {
                          // validate rights
                          //console.log("EDIT RIGHTS NOT WORKING", ProductMeta.userId, $scope.AuthData.uid)
                          if(ProductMeta.userId == $scope.AuthData.uid) {
                              $scope.ProductMeta = ProductMeta;   // bind the data
                              initEditMode();                     // load images and screenshots
                          } else {
                              initNewSubmission();
                          }
                      } else {
                          currentProductId = null;
                          initNewSubmission();    // technically an error
                      };
                  },
                  function(error){
                      initError();
                  }
              )
          } else {
              initNewSubmission();
          };
      } else {
          initError();
      };
      
      // stateA - new
      function initNewSubmission() {
          
          $scope.status["generalView"]    = "new";
          $scope.status["editMode"]       = false;
          currentProductId                = null; 
          
          $scope.ProductMeta = {
              userId: $scope.AuthData.uid
          };
          $scope.status['loadingScreenshots'] = false
  
      };
      
      // stateB - edit mode
      function initEditMode() {                       //console.log("edit submission")
          $scope.status["generalView"]    = "edit";
          $scope.status["editMode"]       = true;
          
          // -->
          $scope.ProductMeta["date_end_raw"] = new Date($scope.ProductMeta["date_end"]);
          
          // -->
          loadScreenshots();
      };
      
      // stateB - something went wrong
      function initError() {
          $scope.status["generalView"] = "error";     //console.log("error")
      };
      
  };
  

  // -------------------------------------------------------------------------
  // Load editable data
  function loadScreenshots() {
      // load images
      Products.getProductScreenshots(currentProductId).then(
          function(ScreenshotsData){
              processScreenshotsData(ScreenshotsData);
          },
          function(error){
              //console.log(error);
              $scope.status["generalView"] = "error";
          }
      );
  };
  
  
  $scope.simulateSubmit = function() {
      
      $scope.ProductMeta = {
          'productType': 'local',
          'categoryId': 'coupon',
          'tagsString': 'semin, test, hello',
          'title': 'Hello world',
          'location': 'London, uk',
          'price_old': 5,
          'price_now': 6,
          'date_end_raw': new Date(),
          'userId': $scope.AuthData.uid
      };
      
      $scope.submitForm();
  };
  
  /**
   * Validate and Submit the form with ProductMeta
   */
  $scope.status['submitLoading'] = false;
  $scope.submitForm = function() {
      
      console.log('submit form')
      
      // validate
      if(validateProductMeta()){
        
          console.log('submit form passed');
          
          // referential
          addReferentialData();
          
          // psubmit
          $scope.status['submitLoading']      = true;
          
          console.log($scope.ProductMeta, $scope.status['editMode'])
          
          switch ($scope.status['editMode']) {
              case true:
                  //
                  Products.editProduct($scope.ProductMeta, $scope.ProductImages, Auth.AuthData, currentProductId).then(
                      function(success){
                          handleSuccess(currentProductId);
                      },
                      function(error){
                          handleError(error)
                      }
                  );
                  break
              case false:
                  //
                  Products.submitProduct($scope.ProductMeta, $scope.ProductImages, Auth.AuthData).then(
                      function(productId){
                          handleSuccess(productId);
                      },
                      function(error){
                          handleError(error)
                      }
                  );
                  break
          } // ./ switch
          
      };
      
      // fn error
      function handleError(error) {
          $scope.status['submitLoading']      = false;
          $scope.status['containsNoError']    = false;
          $scope.ErrorMessages['general']     = "Ooops Something went wrong... try again or contact us with reference code " + error;
      };
      
      // fn success
      function handleSuccess(productId) {
          $scope.status['submitLoading']      = false;
          $scope.status['containsNoError']    = false;
          $state.go('app.live');
      };
      
  };
  

  /**
   * Used for filtering
   * *** put this on the SERVER
   */
   
  function addReferentialData() {
      // server values firebase
      $scope.ProductMeta["timestamp_update"] = Firebase.ServerValue.TIMESTAMP;
      if(!$scope.ProductMeta.hasOwnProperty('timestamp_creation')) {
          $scope.ProductMeta["timestamp_creation"] = Firebase.ServerValue.TIMESTAMP;
      };
      
      // transform to timestamp
      $scope.ProductMeta["date_end"] = $scope.ProductMeta["date_end_raw"].getTime()
      
  };
  

  
  /**
   * 
   * Base 64 File Upload
   * *** Redo to one function
   * 
   */
  $scope.dimensions = {
      screenshot: {
          w: 400,
          h: 200
      }
  };
  
  // CUSTOM import images
  var ProductImagesArray = [];
  
  $scope.importImage = function() {
    // Show the action sheet
    $ionicActionSheet.show({
        buttons: [
            { text: 'Take a new picture' },
            { text: 'Import from phone library' },
        ],
        destructiveText: 'Remove current image',
        titleText: 'Import banner image',
        cancelText: 'Cancel',
        cancel: function() {
            // add cancel code..
        },
        buttonClicked: function(sourceTypeIndex) {
          proceed(sourceTypeIndex)
          return true;
        },
        destructiveButtonClicked: function() {
          $scope.removeImage();
          return true;
        }
    });
    function proceed(sourceTypeIndex) {
      CordovaCamera.newImageTest(sourceTypeIndex, $scope.dimensions.screenshot).then(
        function(bannerBase64){
          // --> process
          transformArrayToScreenshot(bannerBase64);
        },
        function(error){
          Codes.handleError();
        }
      )
      
    };
  };
  
  $scope.removeImage = function() {
    $scope.ProductImages = {};
  };

  
  /**
  var ProductImagesArray = [];
  $scope.onLoad9 = function (e, reader, file, fileList, fileOjects, fileObj) {
      Utils.resizeImage("canvas9", fileObj.base64, $scope.dimensions["screenshot"].w, $scope.dimensions["screenshot"].h).then(
          function(resizedBase64){
              ProductImagesArray.push(resizedBase64);
              transformArrayToScreenshot();
          }, function(error){
              //console.log(error)
          }
      )
  };
  
  $scope.removeScreenshot = function(key){
      var index = key.match(/\d+/)[0];
      //console.log('remove', key, index)
      //console.log(ProductImagesArray)
      ProductImagesArray.splice(index-1, 1);
      transformArrayToScreenshot();
  };
  */
  
  // takes ProductImagesArray and sets in ProductsImages  
  function transformArrayToScreenshot(bannerBase64) {
    $scope.ProductImages['screenshot1'] = bannerBase64;
    Utils.resizeImageSoft("canvas9", bannerBase64, $scope.dimensions["screenshot"].w, $scope.dimensions["screenshot"].h).then(
      function(iconBase64){
          $scope.ProductImages['icon'] = iconBase64;
      }, function(error){
          Codes.handleError();
      }
    )
  };
  
  // ** depreciated
  function initProductArray() {
      var iter = 0;
      angular.forEach($scope.ProductImages, function(value, key){
          if(key != 'icon') {
              ProductImagesArray[iter] = value;
              iter = iter+1; 
          }
      })
  };
  
  
  // handling 
  // v2
  function processScreenshotsData(ScreenshotsData) {
      $scope.ProductImages = ScreenshotsData;
      initProductArray();
      $scope.status['loadingScreenshots'] = false;
  };
  
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  
  
  /**
   * Other helpers and buttons
   */
  function scrollToSubmitEnd() {
     // ** remove
  };
  
  // -------------------------------------------------------------------------
  // navigation wise 
  
  $scope.goTo = function(nextState) {
      $state.go(nextState);
  };
  
  // -------------------------------------------------------------------------
  // Validate submitform
  
  function validateProductMeta() {
      $scope.ErrorMessages = {};
      $scope.status['containsNoError'] = true;
      //
      // submission - productType
      if(!$scope.ProductMeta.hasOwnProperty("productType")) {
          $scope.ErrorMessages["productType"] = 
              "Please select a productType";
              $scope.status['containsNoError'] = false;
      };
      if( $scope.ProductMeta["productType"] == "" || 
          $scope.ProductMeta["productType"] == null ||
          $scope.ProductMeta["productType"] == undefined) {
          $scope.ErrorMessages["productType"] = 
              "Please select a deal type";
              $scope.status['containsNoError'] = false;
      };
      //
      // submission - categoryId
      if(!$scope.ProductMeta.hasOwnProperty("categoryId")) {
          $scope.ErrorMessages["categoryId"] = 
              "Please select a categoryId";
              $scope.status['containsNoError'] = false;
      };
      if( $scope.ProductMeta["categoryId"] == "" || 
          $scope.ProductMeta["categoryId"] == null ||
          $scope.ProductMeta["categoryId"] == undefined) {
          $scope.ErrorMessages["categoryId"] = 
              "Please select a categoryId";
              $scope.status['containsNoError'] = false;
      };
      //
      // tags string
      if(!$scope.ProductMeta.hasOwnProperty("tagsString")) {
          $scope.ErrorMessages["tagsString"] = 
              "Add at least one tag. Tags should be seperated by comma";
              $scope.status['containsNoError'] = false;
      };
      //
      // product details - title
      if(!$scope.ProductMeta.hasOwnProperty("title")) {
          $scope.ErrorMessages["title"] = 
              "Title missing";
              $scope.status['containsNoError'] = false;
      };
      if( $scope.ProductMeta["title"] == "" || 
          $scope.ProductMeta["title"] == null ||
          $scope.ProductMeta["title"] == undefined) {
          $scope.ErrorMessages["title"] = 
              "Title missing";
              $scope.status['containsNoError'] = false;
      };
      
      //
      // product details - price_now
      if(!$scope.ProductMeta.hasOwnProperty("date_end_raw")) {
          $scope.ErrorMessages["date_end_raw"] = 
              "Date missing";
              $scope.status['containsNoError'] = false;
      };
      if( $scope.ProductMeta["date_end_raw"] == "" || 
      $scope.ProductMeta["date_end_raw"] == null ||
      $scope.ProductMeta["date_end_raw"] == undefined) {
      $scope.ErrorMessages["date_end_raw"] = 
          "Date missing";
          $scope.status['containsNoError'] = false;
      };
      
      //
      // ---------------------------------------------------------------------
      switch ($scope.ProductMeta.productType) {
          case 'local':
              //
              validate_local();
              break
          case 'online':
              //
              validate_online();
              break
          case 'voucher':
              //
              validate_voucher();
              break
      };
      
      // fn val
      function validate_local() {
          // product details - location
          if(!$scope.ProductMeta.hasOwnProperty("location")) {
              $scope.ErrorMessages["location"] = 
                  "Location missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["location"] == "" || 
              $scope.ProductMeta["location"] == null ||
              $scope.ProductMeta["location"] == undefined) {
              $scope.ErrorMessages["location"] = 
                  "Location missing";
                  $scope.status['containsNoError'] = false;
          };
          //
          // product details - price_old
          if(!$scope.ProductMeta.hasOwnProperty("price_old")) {
              $scope.ErrorMessages["price_old"] = 
                  "Price missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["price_old"] == "" || 
          $scope.ProductMeta["price_old"] == null ||
          $scope.ProductMeta["price_old"] == undefined) {
          $scope.ErrorMessages["price_old"] = 
              "Price missing";
              $scope.status['containsNoError'] = false;
          };
          //
          // product details - price_now
          if(!$scope.ProductMeta.hasOwnProperty("price_now")) {
              $scope.ErrorMessages["price_now"] = 
                  "Price missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["price_now"] == "" || 
          $scope.ProductMeta["price_now"] == null ||
          $scope.ProductMeta["price_now"] == undefined) {
          $scope.ErrorMessages["price_now"] = 
              "Price missing";
              $scope.status['containsNoError'] = false;
          };
      };
      // fn val
      function validate_online() {
          // product details - location
          if(!$scope.ProductMeta.hasOwnProperty("web_link")) {
              $scope.ErrorMessages["web_link"] = 
                  "Weblink missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["web_link"] == "" || 
              $scope.ProductMeta["web_link"] == null ||
              $scope.ProductMeta["web_link"] == undefined) {
              $scope.ErrorMessages["web_link"] = 
                  "Weblink missing";
                  $scope.status['containsNoError'] = false;
          };
          //
          // product details - price_old
          if(!$scope.ProductMeta.hasOwnProperty("price_old")) {
              $scope.ErrorMessages["price_old"] = 
                  "Price missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["price_old"] == "" || 
          $scope.ProductMeta["price_old"] == null ||
          $scope.ProductMeta["price_old"] == undefined) {
          $scope.ErrorMessages["price_old"] = 
              "Price missing";
              $scope.status['containsNoError'] = false;
          };
          //
          // product details - price_now
          if(!$scope.ProductMeta.hasOwnProperty("price_now")) {
              $scope.ErrorMessages["price_now"] = 
                  "Price missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["price_now"] == "" || 
          $scope.ProductMeta["price_now"] == null ||
          $scope.ProductMeta["price_now"] == undefined) {
          $scope.ErrorMessages["price_now"] = 
              "Price missing";
              $scope.status['containsNoError'] = false;
          };
      };
      // fn val
      function validate_voucher() {
          // product details - location
          if(!$scope.ProductMeta.hasOwnProperty("voucher_link")) {
              $scope.ErrorMessages["voucher_link"] = 
                  "Voucher link missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["voucher_link"] == "" || 
              $scope.ProductMeta["voucher_link"] == null ||
              $scope.ProductMeta["voucher_link"] == undefined) {
              $scope.ErrorMessages["voucher_link"] = 
                  "Voucher link missing";
                  $scope.status['containsNoError'] = false;
          };
          //
          // product details - price_old
          if(!$scope.ProductMeta.hasOwnProperty("discount_perc")) {
              $scope.ErrorMessages["discount_perc"] = 
                  "Discount % missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["discount_perc"] == "" || 
          $scope.ProductMeta["discount_perc"] == null ||
          $scope.ProductMeta["discount_perc"] == undefined) {
          $scope.ErrorMessages["discount_perc"] = 
              "Discount % missing";
              $scope.status['containsNoError'] = false;
          };
          //
          // product details - price_now
          if(!$scope.ProductMeta.hasOwnProperty("discount_code")) {
              $scope.ErrorMessages["discount_code"] = 
                  "Discount code missing";
                  $scope.status['containsNoError'] = false;
          };
          if( $scope.ProductMeta["discount_code"] == "" || 
          $scope.ProductMeta["discount_code"] == null ||
          $scope.ProductMeta["discount_code"] == undefined) {
          $scope.ErrorMessages["discount_code"] = 
              "Discount code missing";
              $scope.status['containsNoError'] = false;
          };
      };
      
      
      //
      // generic
      if (!$scope.status['containsNoError']) {
          $scope.status['submitLoading'] = false;
          $scope.ErrorMessages['general'] = 
          "There are some errors in your submission. Please check all fields in red";
      };

      return $scope.status['containsNoError'];
  };
  
  
  
  

  $scope.goTo = function(nextState) {
    $state.go(nextState)
  };

});
