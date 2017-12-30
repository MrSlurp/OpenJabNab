'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiHelpers',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnApiAccount',

], function () {
angular.module('ojnApiModule')
  .factory('ojnApiPlugins', function ($http, $q, ojnApiAccount, ojnApiHelpers) {
    console.log("ojnApiPlugins ready for duty");
    var _baseApiPath = "/ojn_api/json";
    var _pluginsApiPath = _baseApiPath + "/plugins";
    
    var _getAllPluginsData = function(cb) {
      var url = _pluginsApiPath + "/getAllPluginsData?"+ojnApiAccount.getTokenUrl();
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
      getAllPluginsData: function () {
        var defer = $q.defer();
        _getAllPluginsData(function (data) { defer.resolve(data);});
        return defer.promise;
      }
    }
  });
});
