dwlPopup.controller("dwlPopupCtrl", ['$scope', '$route','$location','$routeParams','$q','debugSer','bgSer','ajaxSer','TITLE','AUTHOR',
                                                 function ($scope, $route, $location, $routeParams, $q, debugSer, bgSer, ajaxSer, TITLE, AUTHOR) {

    $scope.name = 'common';

    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.title = TITLE;
    $scope.author = AUTHOR;

    $scope.debug = debugSer;

    $scope.bg = bgSer;

    $scope.bg.assign().then(function(o){
        $scope.bookmarker = o.bookmarker;
        $scope.dwlBk = o.dwlBk;
    });

    $scope.ajax = ajaxSer;

    $scope.query = '';
    $scope.queryType = 'query';

    $scope.edit = false;
    $scope.switchEditing = function (check) {
        if(typeof(check) === 'undefined') {
            check = false;
        }
        if(check) {
            if(!$scope.edit) {
                $scope.edit = !$scope.edit;
            }
        } else {
            $scope.edit = !$scope.edit;
        }
    };

    $scope.getLiveHtml = function (bookmark) {
        var deferred = $q.defer();

        $scope.ajax.getLiveHtml(bookmark).then(function(bookmark){
            deferred.resolve();
        });

        return deferred.promise;
    };

    $scope.openTab = function (url) {
        $scope.bookmarker.openTab(url);
    };

    $scope.refresh = {};
    $scope.refresh.common = function() {
        $scope.bg.reload().then(function(){
            $scope.refresh[$scope.$route.current.locals.$scope.name]();
        });
    };

    $scope.createBookmark = function(bookmark,scope) {
        jQuery('.dwlLoading').show();
        $scope.bookmarker.createChromeBookmarks(bookmark).then(function(bk){
            $scope.refresh.common();
        });
    }

    $scope.removeBookmark = function(id) {
        jQuery('.dwlLoading').show();
        $scope.bookmarker.removeChromeBookmarks(id).then(function(){
            $scope.refresh.common();
        }, function(){
            $scope.refresh.common();
        });
    }

    $scope.updateBookmark = function(newBookmark, oldBookmark) {
        if(
          oldBookmark.id === newBookmark.id
           && (
               oldBookmark.title !== newBookmark.title
               ||
               oldBookmark.url !== newBookmark.url
           )
        ) {
            jQuery('.dwlLoading').show();
            var b = {
                'id' : newBookmark.id,
                'title' : newBookmark.title,
                'url' : newBookmark.url
            };
            console.log(b);
            $scope.bookmarker.updateChromeBookmark(b).then(function(bk){
                $scope.refresh.common();
            });
        }
    };

}]);

dwlPopup.controller("dwlIndexCtrl", ['$scope',
                                                 function ($scope) {

    $scope.name = 'index';

    $scope.refresh.index = function() {
        jQuery('.dwlLoading').hide();
    };

}]);

/* -------------------------------------- */
/* -----------PAGE ----------------- */
/* -------------------------------------- */
dwlPopup.controller("dwlPageCtrl", ['$scope','$timeout','$q',function ($scope,$timeout,$q) {

    $scope.name = 'page';

    $scope.page = {};

    $scope.refresh.page = function() {
        $scope.init().then(function(){
            jQuery('.dwlLoading').hide();
        });
    };

    $scope.init = function() {
        var deferred = $q.defer();

        $scope.bg.assign().then(function(o){
            $scope.dwlBk = o.dwlBk;
            angular.copy(o.dwlBk, $scope.page);
            $scope.query = '';
            if(o.dwlBk.similar.length > 0) {
                $scope.query = o.dwlBk.tab.parsedUrl.tld;
            }
            deferred.resolve();
        });

        return deferred.promise;
    };

    $scope.$watch(function(){
        return $scope.edit;
    },function(newValue, oldValue){
        if(!newValue && typeof ($scope.dwlBk.bookmarks) !== "undefined" && typeof ($scope.page.bookmarks) !== "undefined") {
            for (var i = 0; i < $scope.dwlBk.bookmarks.length; i++) {
                if(typeof ($scope.page.bookmarks[i]) !== 'undefined') {
                    $scope.page.bookmarks[i] = $scope.bookmarker.updateTitle($scope.page.bookmarks[i]);
                    $scope.updateBookmark($scope.page.bookmarks[i], $scope.dwlBk.bookmarks[i]);
                }
            };
        }
    },true);

    $scope.refresh.common();

}]);

/* -------------------------------------- */
/* -----------SEARCH ------------ */
/* -------------------------------------- */
dwlPopup.controller("dwlsearchCtrl", ['$scope','$routeParams','$q',function ($scope,$routeParams,$q) {

    $scope.name = 'search';

    $scope.search = {
        'results' : [],
        'live' : []
    };

    $scope.refresh.search = function() {
        $scope.searchBookmark();
    };

    $scope.init = function() {
        var deferred = $q.defer();

        $scope.bg.assign().then(function(o){
            $scope.dwlBk = o.dwlBk;
            $scope.query = '';

            if(typeof($routeParams.query) !== 'undefined') {
                $scope.query = atob($routeParams.query);
            }
            if(typeof($routeParams.queryType) !== 'undefined') {
                $scope.queryType = $routeParams.queryType;
            }

            if($scope.query === '') {
                $scope.query = o.dwlBk.query;
                $scope.queryType = 'query';
            }

            $scope.searchBookmark();

            deferred.resolve();
        });

        return deferred.promise;
    };

    $scope.searchBookmark = function() {
        jQuery('.dwlLoading').show();

        $scope.search = {
            'results' : [],
            'live' : []
        };

        $scope.bookmarker.searchChromeBookmark($scope.query, $scope.queryType).then(function(bk){
            for (var i = 0; i < bk.length; i++) {
                bk[i] = $scope.bg.upgradeBookmark(bk[i],'bookmark');
                $scope.search.results.push(bk[i]);
            };
            angular.copy($scope.search.results,$scope.search.live);
            $scope.$apply();
            jQuery('.dwlLoading').hide();
        });
    }

    $scope.$watch(function(){
        return $scope.edit;
    },function(newValue, oldValue){
        if(!newValue && typeof ($scope.search.results) !== "undefined" && typeof ($scope.search.live) !== "undefined") {
            for (var i = 0; i < $scope.search.results.length; i++) {
                if(typeof ($scope.search.live[i]) !== 'undefined') {
                    $scope.search.live[i] = $scope.bookmarker.updateTitle($scope.search.live[i]);
                    console.log($scope.search.live[i]);
                    $scope.updateBookmark($scope.search.live[i], $scope.search.results[i]);
                }
            };
        }
    },true);

    $scope.init();

}]);
