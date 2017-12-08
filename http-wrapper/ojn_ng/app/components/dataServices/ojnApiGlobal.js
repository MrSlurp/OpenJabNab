'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule', 
  'app/components/dataServices/ojnApiHelpers', 
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnngEvents',
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiGlobal', function ($http, $q, ojnngError, ojnngEvents, ojnApiHelpers) {
    console.log("ojnApiGlobal ready for duty");
    
    var _baseApiPath = "/ojn_api/json";
    var _globalApiPath = _baseApiPath + "/global";
    
    var _globalAboutData = {};
    var _globalPingData = {};
    var _globalStatsData = {};
    
    var _ojnStatusOk = true;
    var _setOjnServerStatus = function(status)
    {
      if (_ojnStatusOk != status)
      {
        _ojnStatusOk = status;
        ojnngEvents.notifyEvent("OjnServerStateChanged");
      }
    };
    
    // return about data from server
    var _getGlobalAbout = function (cb) {
      if (ojnApiHelpers.handleSimuRequest(cb))
        return;
      var url = _globalApiPath + "/about";
      $http.get(url).then( function (response) {
          _setOjnServerStatus(true);
          _globalAboutData = response.data;
          if (cb) cb();
        },
        function (error){ 
          _setOjnServerStatus(false);
          if (cb) cb();
        }
      );
    };
    
    // return ping data from server
    var _getGlobalPing = function (cb) {
      if (ojnApiHelpers.handleSimuRequest(cb, 
          { ConnectedBunnies : "NA", MaxBurstNumberOfBunnies : "NA", MaxNumberOfBunnies : "NA" })
         )
        return;
        
      var url = _globalApiPath + "/ping";
      $http.get(url).then( function (response) {
          _globalPingData = response.data;
          if (cb) cb(response.data);
          _setOjnServerStatus(true);
        },
        function (error){ 
          if (cb)
            cb({ ConnectedBunnies : "??", MaxBurstNumberOfBunnies : "??", MaxNumberOfBunnies : "??" });
            
          _setOjnServerStatus(false);
        }
      );
    }
    
    // return stats data from server
    var _getGlobalStats = function (cb) {
      if (ojnApiHelpers.handleSimuRequest(cb, {} ))
        return;
    
      var url = _globalApiPath + "/stats";
      $http.get(url).then(
        function (response) {
          _globalStatsData = response.data;
          if (cb) cb(response.data);
          _setOjnServerStatus(true);
        },
        function (error){ 
          if (cb) cb();
          _setOjnServerStatus(false);
        }
      );
    }

    _getGlobalAbout();

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
      isServerOk:function()
      {
        return _ojnStatusOk;
      },
      /*
      getApiGlobalFullApi: function () {
      
      }*/
    }
  });
});
