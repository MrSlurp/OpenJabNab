'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',  
  'app/components/dataServices/ojnngError',  
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiGlobal', function ($http, $q, ojnngError) {
    console.log("ojnApiGlobal ready for duty");
    
    var _baseApiPath = "/ojn_api/json";
    var _globalApiPath = _baseApiPath + "/global";
    
    var _globalAboutData = {};
    var _globalPingData = {};
    var _globalStatsData = {};
    
    // return about data from server
    var _getGlobalAbout = function (cb) {
      var url = _globalApiPath + "/about";
      $http.get(url).then(
        function (response) {
          _globalAboutData = response.data;
          if (cb)
            cb();
        },
        function (error){ 
          if (cb)
            cb();
        }
      );
    };
    
    // return ping data from server
    var _getGlobalPing = function (callback) {
        var url = _globalApiPath + "/ping";
        $http.get(url).then(
          function (response) {
            _globalPingData = response.data;
            if (callback)
              callback(response.data);
          },
          function (error){ 
            _setToken(null);
          }
        );
    }
    
    // return ping data from server
    var _getGlobalStats = function (callback) {
        var url = _globalApiPath + "/stats";
        $http.get(url).then(
          function (response) {
            _globalStatsData = response.data;
            if (callback)
              callback(response.data);
          },
          function (error){ 
            _setToken(null);
          }
        );
    }

    _getGlobalAbout();
    _getGlobalPing();

    return {
      getApiGlobalAbout: function () {
        var defer = $q.defer();
        _globalAboutData(function (response) { defer.resolve(response);});
        return defer.promise;
      },
      getApiGlobalStats: function () {
        var defer = $q.defer();
        _getGlobalStats(function (response) { defer.resolve(response);});
        return defer.promise;
      },
      getApiGlobalPing: function(){
        var defer = $q.defer();
        _getGlobalPing(function (response) { defer.resolve(response);});
        return defer.promise;
      },
      getApiGlobalFullApi: function () {
      
      }
    }
  });
});
