'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnApiHelpers',
], function () {
angular.module('ojnPluginSurprise')
  .factory('ojnApiAccount', function ($http, $q, $cookieStore, ojnngEvents, ojnngError, ojnApiHelpers) {
    console.log("ojnApiAccount ready");
    var _baseApiPath = "/ojn_api/json";
    var _surpriseApiPath = _baseApiPath + "/suprise";
    
    // return about data from server
    var _getConfigs = function (cb) {
      var url = _surpriseApiPath + "/getConfigValues?"+ojnApiAccount.getTokenUrl();
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
      getConfigs: function () {
        var defer = $q.defer();
        _getUserBunnies(function (response) { defer.resolve(response);});
        return defer.promise;
      }
    }
  });
});
