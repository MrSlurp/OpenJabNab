'use strict';

define([
  'angular',
], function () {
    angular.module('ojnApiModule', [])
      .factory('ojnApiService', function ($http, $interval, $q) {
        console.log("ojnApiService ready for duty");
        var _baseJsonApiPath = "/ojn_api/json"
        var _globalAboutData = {};
        var _globalPingData = {};
        var _authToken = null;
        
        
        var _getGlobalAbout = function () {
            var url = _baseJsonApiPath + "/global/about";
            $http.get(url).then(
              function (response) {
                _globalAboutData = response.data;
              },
              function (error){ }
            );
        };
        
        var _getGlobalPing = function (callback) {
            var url = _baseJsonApiPath + "/global/ping";
            $http.get(url).then(
              function (response) {
                _globalPingData = response.data;
                if (callback)
                  callback(response.data);
              },
              function (error){ }
            );
        }
        
        var _doLoginRequest = function (l,p, callback) {
            var url = _baseJsonApiPath + "/accounts/auth?login="+l+"&pass="+p;
            $http.get(url).then(
              function (response) {
                _authToken = response.data;
                if (callback)
                  callback();
              },
              function (error){ }
            );
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
        
        
        var promise = $interval(function () {
            //console.log("active district Id = " + JSON.stringify(_activeDistrictId));
            //if (_LocalTest)
            //    _internalGetCityData();
            //else {
                //_internalGetDistrictIds();
            //}
            //_getGlobalPing();
            
        }.bind(this), 2000);
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
                //_subscribers.push(subscriber);
            },
            getApiGlobalStats: function () {
                //_subscribers.push(subscriber);
            },
            getApiGlobalPing: function(){
              var defer = $q.defer();
              _getGlobalPing(function (response) { defer.resolve(response);});
              return defer.promise;
            },
            getApiGlobalFullApi: function () {
                //_activeDistrictId = id;
            }
        }
    });
});
