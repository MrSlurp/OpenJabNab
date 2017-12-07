'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiAccount',
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiBunny', function ($http, $q, ojnApiAccount) {
    console.log("ojnApiBunny ready for duty");
    var _baseApiPath = "/ojn_api/json";
    var _bunnyApiPath = _baseApiPath + "/bunny";
    
    var _doBunnyRename = function(mac, newName, cb)
    {
      var url = _bunnyApiPath + "/"+ mac + "/setBunnyName?" + ojnApiAccount.getTokenUrl() + "&name=" + newName;
      $http.get(url).then(
        function (response) {
          // parse token check response
          if (cb) cb();
        },
        function (error){ 
          
          if (cb) cb();
        }
      );
    }

    return {
      doBunnyRename: function (mac, newName) {
        var defer = $q.defer();
        _doBunnyRename(mac, newName, function () { defer.resolve();});
        return defer.promise;
      }
    }
  });
});
