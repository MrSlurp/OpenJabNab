'use strict';

define([
  'angular',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnApiGlobal',
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiAccount', function ($http, $interval, $q, $cookieStore, ojnApiGlobal, ojnngEvents) {
    console.log("ojnApiAccount ready");
    var _baseApiPath = "/ojn_api/json";
    var _accountsApiPath = _baseApiPath + "/accounts";
    
    var _authToken = undefined;
    
    
    // TODO add expiration period (should be returned by API)
    var _setToken= function(value)
    {
      _authToken = value;
      $cookieStore.put("SavedToken", _authToken);
      ojnngEvents.notifyEvent("TokenChanged");
    }
    
    try
    {
      var value = $cookieStore.get("SavedToken");
      if (!(typeof value === "string" || value instanceof String) || value == "[object Object]")
        _authToken = undefined;
      else
        _setToken(value)
    }
    catch(ex)
    {
    }

    
    var _isErrorApiStatusMessage = function(value)
    {
      if (value == undefined || value["status"] == undefined)
      {
        console.log("_isErrorApiStatusMessage = " + value);
        return false;
      }
        
      if (value["status"] == "error")
      {
        ojnngError.notifyError("OjnAccount : " + value["message"]);
        return true;
      }
      else if (value["status"] != "ok")
      {
        ojnngError.notifyError("OjnAccount unknown");
        return true;
      }        
      return false;
    }
    
    // TODO add support for token check on server
    var _checkTokenIsValid = function(cb)
    {
      var url = _accountsApiPath + "/checkToken?token=" + _authToken;
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
    
    // perform login request, the password should be hashed7 before being sent
    // need to change this server side
    var _doLoginRequest = function (l,p, cb) {
      var url = _accountsApiPath + "/auth?login="+l+"&pass="+p;
      $http.get(url).then(
        function (response) {
          if (!_isErrorApiStatusMessage(response.data))
            _setToken(response.data.value);
          else
            _setToken(null);
            
          if (cb) 
            cb();
        },
        function (error){ 
          ojnngError.notifyError("OjnAccount http error " + error);
          _setToken(null);
          
          if (cb)
            cb();
        }
      );
    }
    
    // ask the server to end token validity (instead of waiting for session timeout)
    var _doLogout = function (cb) {
      if (_authToken != undefined)
      {
        var url = _accountsApiPath + "/logout?token="+_authToken;
        $http.get(url).then(
          function (response) {
            _isErrorApiStatusMessage(response.data);
            /*
            if (response.data["status"] != undefined
               && response.data["status"] == "ok")*/
            _setToken(null);
              
            if (cb)
              cb();
          },
          function (error){ 
            ojnngError.notifyError("OjnAccount http error " + error);
            _setToken(null);
            // raise error message
            if (cb)
              cb();
          }
        );    
      }
    }

    return {
      doUserLogin: function (l, p) {
        var defer = $q.defer();
        _doLoginRequest(l, p, function () { defer.resolve();});
        return defer.promise;
      },
      hasToken: function () {
        return _authToken!=null;
      },
      getTokenUrl: function () {
        return "token="+_authToken;
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
      }
    }
  });
});
