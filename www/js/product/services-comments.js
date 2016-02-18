angular.module('starter.services-comments', [])


.factory('Comments', function($q, Indexing, Profile) {
    var self = this;
    
    // GET
    self.load = function(productId) {
        var qLoad = $q.defer();
        var ref = new Firebase(FBURL);
        //
        ref.child("products_comments").child(productId).on("value", function(snapshot) {
            qLoad.resolve(snapshot.val());
        }, function (errorObject) {
            qLoad.reject(errorObject);
        });
        return qLoad.promise;
    };
    
    // SET
    self.post = function(productId, uid, commentObj) {
        var qPost = $q.defer();
        var ref = new Firebase(FBURL);
        
        // callback
        var onComplete = function(error) {
            if (error) {
                //console.log('Synchronization failed 2', error);
                qPost.reject({
                    error: error,
                    productId: productId
                });
            } else {
                // -->
                //console.log('Synchronization succeeded 2');
                handleUpdates(productId)
                qPost.resolve(productId)
            }
        }
        
        // synchronisation
        // root/products_comments/$productId/$commentId/value
        ref.child("products_comments").child(productId).child(uid).push(
            commentObj, 
            onComplete
        )
        return qPost.promise;
        
        // dynamic updates and indexing for comments
        function handleUpdates(productId) {
            Indexing.updateDynamicIndex(productId, 'comment_new');
        };
    };
    
    
    self.loadProfiles = function(Comments) {
        var promises = {};
        for (var i=0; i<Comments.length; i++) {
            var promise = Profile.get(Comments[i].userId).then(
                function(ProfileData){
                    //var keys = Object.keys(ProfileData);
                    //return ProfileData[keys[0]];
                    return ProfileData;
                },
                function(error){
                    return error;
                    //console.log(error)
                }
            )
            promises[Comments[i].userId] = promise;
        }
        return $q.all(promises)
    };
    
  
    return self;
})

// ----------------------------------------------------------------------------
// upvotes
.factory('Upvotes', function($q, Indexing) {
    var self = this;
    
    // GET
    self.load = function(productId) {
        var qLoad = $q.defer();
        var ref = new Firebase(FBURL);
        //
        ref.child("products_upvotes").child(productId).on("value", function(snapshot) {
            qLoad.resolve(snapshot.val());
        }, function (errorObject) {
            qLoad.reject(errorObject);
        });
        return qLoad.promise;
    };
    
    function didUserVote(productId, uid) {
        var qTest = $q.defer();
        var ref = new Firebase(FBURL);
        //
        ref.child("products_upvotes").child(productId).child(uid).on("value", function(snapshot) {
            if(snapshot.val() != null) {
                qTest.resolve(true);  // already voted
            } else {
                qTest.resolve(null);  // not voted
            }
        }, function (errorObject) {
            qTest.reject(errorObject);
        });
        return qTest.promise;
    }
    
    // SET
    self.post = function(productId, uid) {
        var qPost = $q.defer();
        var ref = new Firebase(FBURL);
        
        // test if user already voted
        didUserVote(productId, uid).then(
            function(answer){
                console.log('diduservote?', answer)
                if(answer == null) {
                    //
                    // --> proceed
                    proceed();
                } else {
                    qPost.resolve();
                }
            },
            function(error){
                qPost.reject(error)
            }
        )
        
        // fn proceed
        function proceed() {
            // callback
            var onComplete = function(error) {
                if (error) {
                    qPost.reject({
                        error: error,
                        productId: productId
                    });
                } else {
                    // -->
                    handleUpdates(productId)
                    qPost.resolve(productId)
                }
            }
            
            // synchronisation
            // root/products_upvotes/$productId/$uid
            ref.child("products_upvotes").child(productId).child(uid).push(
                true, 
                onComplete
            )
        };
        
        return qPost.promise;
        
        // dynamic updates and indexing for comments
        function handleUpdates(productId) {
            Indexing.updateDynamicIndex(productId, 'upvote_new');
        };
    };
    
    
    
    
  
    return self;
})