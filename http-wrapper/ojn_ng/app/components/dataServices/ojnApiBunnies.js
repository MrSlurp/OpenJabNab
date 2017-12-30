'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiHelpers',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnApiAccount',
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiBunnies', function ($http, $q, ojnApiAccount, ojnApiHelpers) {
    console.log("ojnApiBunnies ready for duty");
    var _baseApiPath = "/ojn_api/json";
    var _bunniesApiPath = _baseApiPath + "/bunnies";
    
    // return about data from server
    var _getUserBunnies = function (cb) {
      var url = _bunniesApiPath + "/getUserBunniesStatus?"+ojnApiAccount.getTokenUrl();
      $http.get(url).then(
        function (response) {
          if (cb)
            cb(response.data);
        },
        function (error){ 
          
          if (cb)
            cb(undefined);
        }
      );
    };

    return {
      getUserBunnies: function () {
        var defer = $q.defer();
        _getUserBunnies(function (response) { defer.resolve(response);});
        return defer.promise;
      }
    }
  });
});
