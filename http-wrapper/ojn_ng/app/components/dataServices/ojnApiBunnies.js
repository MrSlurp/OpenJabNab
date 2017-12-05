'use strict';

define([
  'angular',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnApiAccount',
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiBunnies', function ($http, $interval, $q, $cookieStore, ojnApiAccount) {
    console.log("ojnApiBunnies ready for duty");
    var _baseApiPath = "/ojn_api/json";
    //var _userBunnies = {};
    
    // return about data from server
    var _getUserBunnies = function (cb) {
      var url = _baseApiPath + "/bunnies/getUserBunniesStatus?"+ojnApiAccount.getTokenUrl();
      $http.get(url).then(
        function (response) {
          //_userBunnies = response.data;
          if (cb)
            cb(response.data);
        },
        function (error){ 
          _setToken(null);
          if (cb)
            cb(undefined);
        }
      );
    };

    /*
    var promise = $interval(function () {
        //console.log("active district Id = " + JSON.stringify(_activeDistrictId));
        //if (_LocalTest)
        //    _internalGetCityData();
        //else {
            //_internalGetDistrictIds();
        //}
        //_getGlobalPing();
        
    }.bind(this), 2000);*/
    /*
    _getGlobalAbout();
    _getGlobalPing();
    */
    return {
      getUserBunnies: function () {
        var defer = $q.defer();
        _getUserBunnies(function (response) { defer.resolve(response);});
        return defer.promise;
      }
    }
  });
});
