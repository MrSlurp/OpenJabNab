'use strict';

define([
  'angular',
], function () {
angular.module('ojnApiModule', [])
  .factory('ojnApiPlugins', function ($http, $interval, $q, $cookieStore) {
    console.log("ojnApiPlugins ready for duty");
    var _baseApiPath = "/ojn_api/json";
    var _globalApiPath = _baseJsonApiPath + "/global";
    var _pluginsApiPath = _baseJsonApiPath + "/plugins";
    var _pluginApiPath = _baseJsonApiPath + "/plugin";
    var _bunniesApiPath = _baseJsonApiPath + "/bunnies";
    var _bunnyApiPath = _baseJsonApiPath + "/bunny";
    var _ztampsApiPath = _baseJsonApiPath + "/ztamps";
    var _ztampApiPath = _baseJsonApiPath + "/ztamp";
    var _accountsApiPath = _baseJsonApiPath + "/accounts";
    
    var _globalAboutData = {};
    var _globalPingData = {};
    var _authToken = undefined;
    
    var _userInfo = {};
    
    try
    {
      _authToken = $cookieStore.get("SavedToken");
      if (!(typeof _authToken === "string" || _authToken instanceof String) || _authToken == "[object Object]")
        _authToken = undefined;
    }
    catch(ex)
    {
    }
    
    // TODO add expiration period (should be returned by API)
    var _setToken= function(value)
    {
      _authToken = value;
      $cookieStore.put("SavedToken", _authToken);
    }
    
    // TODO add support for token check on server
    var _checkTokenIsValid = function(cb)
    {
      var url = _baseJsonApiPath + "/global/checkToken?token=" + _authToken;
      $http.get(url).then(
        function (response) {
          // parse token check response
          if (cb) cb();
        },
        function (error){ 
          _setToken(null);
          if (cb) cb();
        }
      );
    }
    
    // return about data from server
    var _getGlobalAbout = function (cb) {
      var url = _baseJsonApiPath + "/global/about";
      $http.get(url).then(
        function (response) {
          _globalAboutData = response.data;
          if (cb)
            cb();
        },
        function (error){ 
          _setToken(null);
          if (cb)
            cb();
        }
      );
    };
    
    // return ping data from server
    var _getGlobalPing = function (callback) {
        var url = _baseJsonApiPath + "/global/ping";
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
    
    // perform login request, the password should be hashed7 before being sent
    // need to change this server side
    var _doLoginRequest = function (l,p, cb) {
      var url = _baseJsonApiPath + "/accounts/auth?login="+l+"&pass="+p;
      $http.get(url).then(
        function (response) {
          if (response.data["status"] == undefined)
            _setToken(response.data.value);
          else
            _setToken(null);
            
          if (cb)
            cb();
        },
        function (error){ 
          _setToken(null);
          // raise error message
          if (cb)
            cb();
        }
      );
    }
    
    // ask the server to end token validity (instead of waiting for session timeout)
    var _doLogout = function (cb) {
      if (_authToken != undefined)
      {
        var url = _baseJsonApiPath + "/accounts/logout?token="+_authToken;
        $http.get(url).then(
          function (response) {
            if (response.data["status"] != undefined
               && response.data["status"] == "ok")
              _setToken(null);
              
            if (cb)
              cb();
          },
          function (error){ 
            _setToken(null);
            // raise error message
            if (cb)
              cb();
          }
        );    
      }
    }

    /*
    var _LocalTest = location.port == 60666? true : false;
    var _fileSwitch = false;
    var _activeDistrictId = 0;
    */

    /*
    var _internalGetCityData = function () {
        //console.log("request for city data");
        var url = _fileSwitch == false ? "CityInfo" : "CityInfo2";
        if (_LocalTest == true) {
            url = "SlurpUI/" + url;
            _fileSwitch = !_fileSwitch;
        }
        $http.get(url).success(function (response) {
            _localData = response;
            for (var idx in _subscribers) {
                _subscribers[idx]();
            }
        });
    }
    */

    /*
    var _internalGetDistrictIds = function () {
        //console.log("request for district ids");
        var url = "CityInfo?showList=";
        $http.get(url).success(function (response) {
            if (_districtListChanged(response)) {
                // if any change occured in district list, request for full city data 
                // <enhancement> => request only new district (not sure the perf gain would worth it)
                _internalGetCityData();
            }
            else
                _internalGetActiveDistrict();
        });
    }
    */

    /*
        var getDistrictIndex = function (districtId) {
            if (!_localData)
                return 0;
            for (var idx in _localData.Districts) {
                var district = _localData.Districts[idx];
                if (district.DistrictID == districtId)
                    return idx;
            }
            return 0;
        }

        var _internalGetActiveDistrict = function () {
            var url = "CityInfo?districtID=" + _activeDistrictId;
            $http.get(url).success(function (response) {
                if (response.GlobalDistrict != null) {
                    _localData.GlobalDistrict = response.GlobalDistrict;
                }
                for (var index in response.Districts) {
                    //console.log("updating district id = "+ response.Districts[index].DistrictID);
                    var dindex = getDistrictIndex(response.Districts[index].DistrictID);
                    _localData.Districts[dindex] = response.Districts[index];
                }
                for (var idx in _subscribers) {
                    _subscribers[idx]();
                }
            });

        }

        var _districtListChanged = function (districtIds) {
            if (!_localData || !districtIds)
                return true;

            for (var idx in _localData.Districts) {
                var district = _localData.Districts[idx];
                if (districtIds.indexOf(district.DistrictID) < 0)
                    return true;
            }
            return false;
        }*/

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
    
    _getGlobalAbout();
    _getGlobalPing();

    return {
      doUserLogin: function (l, p) {
        var defer = $q.defer();
        _doLoginRequest(l, p, function () { defer.resolve();});
        return defer.promise;
      },
      hasToken: function () {
        return _authToken!=null;
      },
      verifyToken: function () {
        var defer = $q.defer();
        _checkTokenIsValid(function () { defer.resolve();});
        return defer.promise;
      },
      doLogout:function(){
        var defer = $q.defer();
        _doLogout(function () { defer.resolve();});
        return defer.promise;
      },
      getApiGlobalStats: function () {
        
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
