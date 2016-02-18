angular.module('starter.services-sharing', [])

.factory('ShareFactory', function($cordovaSocialSharing, $q) {
    var self = this;
    
    self.shareGeneral = function(ProductMeta, ProductImage) {
      
      var shareMessage;
      if(ProductMeta.productType == 'voucher') {
        shareMessage = ProductMeta.discount_perc + "% off on " +  ProductMeta.title;
      } else {
        shareMessage = ProductMeta.title + " now for £" + ProductMeta.price_now;  
      };
      shareMessage = shareMessage + ". Download Deals App to claim this deal";
      
      var shareImageData    = ProductImage;
      var shareSubject      = "Great deal on Deals App";
      var shareLink         = "http://www.dealsapp.com";
      
      console.log(shareMessage, shareSubject, shareImageData, shareLink)
      
      var qShare = $q.defer(); 
      $cordovaSocialSharing
        .share(shareMessage, shareSubject, shareImageData, shareLink) // Share via native share sheet
        .then(function(result) {
          qShare.resolve(true);
        }, function(error) {
          qShare.reject(error);
      });
      return qShare.promise;
    };
    
    return self;
})
